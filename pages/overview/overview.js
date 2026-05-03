const gameService = require('../../services/game-service');
const goalService = require('../../services/goal-service');
const overviewService = require('../../services/overview-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const { formatProbability } = require('../../utils/format-probability');

const throttle = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

Page({
  data: {
    loading: true,
    goals: [],
    games: [],
    allocations: [],
    totalPulls: 0,
    summaryText: '',
    conflicts: [],
    conflictThreshold: 0.8,
    conflictDismissed: false,
    simulatorExpanded: false,
    strategies: [],
    previewingStrategyId: null,
    lastAdjustmentHint: '',
    originalAllocations: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const supportedGames = gameService.getSupportedGames();
      const gamesData = [];
      const goalsData = [];

      for (const gameId of supportedGames) {
        const configResult = gameService.getGameConfig(gameId);
        const resourcesResult = gameService.getGameResources(gameId);
        const targetsResult = await goalService.getGoalsByGame(gameId);

        if (!configResult.success) continue;

        const config = configResult.data;
        let resources = {};
        let targets = [];

        if (resourcesResult.success && resourcesResult.data) {
          resources = resourcesResult.data;
        }
        if (targetsResult.success && targetsResult.data) {
          targets = targetsResult.data;
        }

        const totalPulls = this._calculateTotalPulls(resources, config);
        const probability = this._calculateGameProbability(resources, config);


        const gameData = {
          gameId,
          name: config.name,
          icon: `/assets/images/games/${gameId}.png`,
          resources,
          totalPulls,
          probability,
          probabilityText: formatProbability(probability),
          config,
          target: targets.length > 0 ? targets[0] : null
        };

        gamesData.push(gameData);

        if (targets.length > 0) {
          const target = targets[0];
          const neededPulls = this._estimateNeededPulls(target, resources, config);
          goalsData.push({
            ...gameData,
            target,
            neededPulls
          });
        }
      }

      const totalPulls = gamesData.reduce((sum, g) => sum + g.totalPulls, 0);

      const allocations = gamesData.map(g => ({
        gameId: g.gameId,
        gameName: g.name,
        currentPulls: g.totalPulls,
        originalPulls: g.totalPulls,
        probability: g.probability,
        probabilityText: formatProbability(g.probability),
        percentage: totalPulls > 0 ? Math.round((g.totalPulls / totalPulls) * 100) : 0,
        isPreview: false
      }));

      const avgProbability = gamesData.length > 0
        ? gamesData.reduce((s, g) => s + g.probability, 0) / gamesData.length
        : 0;
      const summaryText = `总资源: ${totalPulls}抽 | 目标: ${goalsData.length}个 | 平均达成率: ${formatProbability(avgProbability)}`;

      const conflictResult = overviewService.detectConflicts(gamesData);
      const conflicts = conflictResult.success ? conflictResult.data : [];

      const strategyResult = overviewService.generateStrategies(gamesData);
      const rawStrategies = strategyResult.success ? strategyResult.data : [];
      const strategies = rawStrategies.map(s => ({
        ...s,
        allocations: (s.allocations || []).map(a => ({
          ...a,
          probabilityText: formatProbability(a.probability)
        }))
      }));

      const conflictsWithText = conflicts.map(c => ({
        ...c,
        probabilityText: formatProbability(c.probability)
      }));

      this.setData({
        goals: goalsData,
        games: gamesData,
        allocations,
        totalPulls,
        summaryText,
        conflicts: conflictsWithText,
        strategies,
        conflictDismissed: false,
        previewingStrategyId: null,
        lastAdjustmentHint: '',
        originalAllocations: JSON.parse(JSON.stringify(allocations)),
        loading: false,

      });
    } catch (err) {
      console.error('加载数据失败:', err);
      this.setData({ loading: false });
    }
  },

  _calculateTotalPulls(resources, config) {
    if (!resources || !config) return 0;
    const conversionRate = config.conversionRate?.primogemsToFate || 160;
    const resourceKeys = Object.keys(config.resources || {});
    if (resourceKeys.length === 0) return 0;
    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;
    const primaryValue = Number(resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;
    return Math.floor(primaryValue / conversionRate) + secondaryValue;
  },

  _calculateGameProbability(resources, config) {
    if (!resources || !config) return 0;
    const conversionRate = config.conversionRate?.primogemsToFate || 160;
    const resourceKeys = Object.keys(config.resources || {});
    if (resourceKeys.length === 0) return 0;
    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;
    const primaryValue = Number(resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;
    const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;
    if (totalPulls === 0) return 0;
    const target = { pulls: Math.min(totalPulls, config.hardPity || 90), currentPity: 0 };
    try {
      const calculator = CalculatorFactory.createCalculator(config);
      const result = calculator.calculate({ resources, target, config });
      if (result.success && result.data && result.data.length > 0) {
        return result.data[result.data.length - 1].cumulativeProbability;
      }
    } catch (err) {
      console.error('概率计算异常:', err);
    }
    return 0;
  },

  _estimateNeededPulls(target, resources, config) {
    const baseRarity = target.rarity || 5;
    const constellations = target.constellations || 0;
    const basePulls = baseRarity === 5 ? 90 : 45;
    const totalNeeded = basePulls * (constellations + 1);
    const currentPulls = this._calculateTotalPulls(resources, config);
    return Math.max(0, totalNeeded - currentPulls);
  },

  onAddGoal() {
    const supportedGames = gameService.getSupportedGames();
    const gameNames = supportedGames.map(id => {
      const config = gameService.getGameConfig(id);
      return config.success ? config.data.name : id;
    });

    wx.showActionSheet({
      itemList: gameNames,
      success: (res) => {
        const gameId = supportedGames[res.tapIndex];
        wx.navigateTo({
          url: `/pages/planning/planning?gameId=${gameId}&autoFocusTarget=true`
        });
      }
    });
  },

  onGoalTap(e) {
    const { gameId } = e.detail;
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`
    });
  },

  onGoalMenu() {
    // 菜单在组件内部处理
  },

  async onGoalDelete(e) {
    const { gameId } = e.detail;
    const targetsResult = await goalService.getGoalsByGame(gameId);
    if (targetsResult.success && targetsResult.data.length > 0) {
      await goalService.deleteGoal(gameId, targetsResult.data[0].id);
      this.loadData();
    }
  },

  onGoalEdit(e) {
    const { gameId } = e.detail;
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}&autoFocusTarget=true`
    });
  },

  onToggleSimulator() {
    this.setData({
      simulatorExpanded: !this.data.simulatorExpanded
    });
  },

  onAllocationChange: throttle(function(e) {
    const { gameId, newPulls, delta } = e.detail;
    const { allocations, games, totalPulls } = this.data;

    const gameData = games.map(g => ({
      gameId: g.gameId,
      name: g.name,
      totalPulls: allocations.find(a => a.gameId === g.gameId)?.currentPulls || g.totalPulls,
      probability: g.probability,
      resources: g.resources,
      config: g.config,
      target: g.target
    }));

    const adjustment = { [gameId]: delta };
    const result = overviewService.calculateAllocation(gameData, adjustment);

    if (result.success) {
      const newAllocations = allocations.map(a => {
        const updated = result.data.find(r => r.gameId === a.gameId);
        if (updated) {
          return {
            ...a,
            currentPulls: updated.newPulls,
            probability: updated.newProbability,
            probabilityText: formatProbability(updated.newProbability),
            percentage: totalPulls > 0 ? Math.round((updated.newPulls / totalPulls) * 100) : 0
          };
        }
        return a;
      });

      const adjustedGame = result.data.find(r => r.gameId === gameId);
      const deductedGame = result.data.find(r => r.delta < 0);

      let hint = '';
      if (adjustedGame && deductedGame && delta !== 0) {
        hint = `从${deductedGame.gameName}挪${Math.abs(deductedGame.delta)}抽到${adjustedGame.gameName} → ${adjustedGame.gameName}: ${adjustedGame.newPulls}抽(${formatProbability(adjustedGame.newProbability)}) | ${deductedGame.gameName}: ${deductedGame.newPulls}抽(${formatProbability(deductedGame.newProbability)})`;
      }

      this.setData({
        allocations: newAllocations,
        lastAdjustmentHint: hint,
        previewingStrategyId: null
      });
    }
  }, 300),

  onAllocationInput(e) {
    const { gameId, currentPulls } = e.detail;
    wx.showModal({
      title: '输入抽数',
      editable: true,
      placeholderText: `当前: ${currentPulls}`,
      success: (res) => {
        if (res.confirm && res.content) {
          const newValue = parseInt(res.content, 10);
          if (!isNaN(newValue) && newValue >= 0) {
            const delta = newValue - currentPulls;
            this.onAllocationChange({
              detail: { gameId, newPulls: newValue, delta, source: 'input' }
            });
          }
        }
      }
    });
  },

  onResetAllocation() {
    const { originalAllocations } = this.data;
    if (!originalAllocations) return;

    this.setData({
      allocations: JSON.parse(JSON.stringify(originalAllocations)),
      lastAdjustmentHint: '',
      previewingStrategyId: null
    });

    wx.showToast({
      title: '已重置为原始分配',
      icon: 'none',
      duration: 2000
    });
  },

  onConflictHelp() {
    this.setData({
      simulatorExpanded: true
    });
  },

  onConflictDismiss() {
    this.setData({
      conflictDismissed: true
    });
  },

  onStrategyPreview(e) {
    const { strategyId } = e.detail;
    const { strategies, totalPulls } = this.data;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    const newAllocations = this.data.allocations.map(a => {
      const alloc = strategy.allocations.find(al => al.gameId === a.gameId);
      if (alloc) {
        return {
          ...a,
          currentPulls: alloc.pulls,
          probability: alloc.probability,
          probabilityText: this._formatProbability(alloc.probability),
          percentage: totalPulls > 0 ? Math.round((alloc.pulls / totalPulls) * 100) : 0,
          isPreview: true
        };
      }
      return a;
    });

    this.setData({
      allocations: newAllocations,
      previewingStrategyId: strategyId,
      simulatorExpanded: true,
      lastAdjustmentHint: `正在预览「${strategy.name}」方案`
    });
  },

  onStrategyApply(e) {
    const { strategyId } = e.detail;
    const { strategies, allocations, totalPulls } = this.data;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    const savePromises = strategy.allocations.map(async (alloc) => {
      const game = this.data.games.find(g => g.gameId === alloc.gameId);
      if (!game) return;

      const conversionRate = game.config.conversionRate?.primogemsToFate || 160;
      const resourceKeys = Object.keys(game.config.resources || {});
      const newResources = { ...game.resources };

      if (resourceKeys[1]) {
        newResources[resourceKeys[1]] = alloc.pulls;
        newResources[resourceKeys[0]] = 0;
      } else {
        newResources[resourceKeys[0]] = alloc.pulls * conversionRate;
      }

      await gameService.updateResources(alloc.gameId, newResources);
    });

    Promise.all(savePromises).then(() => {
      const newOriginal = allocations.map(a => {
        const alloc = strategy.allocations.find(al => al.gameId === a.gameId);
        if (alloc) {
          return {
            ...a,
            currentPulls: alloc.pulls,
            originalPulls: alloc.pulls,
            probability: alloc.probability,
            probabilityText: formatProbability(alloc.probability),
            percentage: totalPulls > 0 ? Math.round((alloc.pulls / totalPulls) * 100) : 0,
            isPreview: false
          };
        }
        return a;
      });

      this.setData({
        allocations: newOriginal,
        originalAllocations: JSON.parse(JSON.stringify(newOriginal)),
        previewingStrategyId: null,
        lastAdjustmentHint: ''
      });

      wx.showToast({
        title: '已采用此方案',
        icon: 'success'
      });

      this.loadData();
    });
  },

  onStrategyCancel() {
    const { originalAllocations } = this.data;
    if (!originalAllocations) return;

    this.setData({
      allocations: JSON.parse(JSON.stringify(originalAllocations)),
      previewingStrategyId: null,
      lastAdjustmentHint: ''
    });
  },

  onGameTap(e) {
    const { gameId } = e.currentTarget.dataset;
    const app = getApp();
    app.globalData.selectedGameId = gameId;
    gameService.currentGameId = gameId;
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`
    });
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});