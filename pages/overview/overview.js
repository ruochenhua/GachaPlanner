const gameService = require('../../services/game-service');
const goalService = require('../../services/goal-service');
const overviewService = require('../../services/overview-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const { formatProbability } = require('../../utils/format-probability');
const themeService = require('../../services/theme-service');

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
    lastAdjustmentHint: '',
    originalAllocations: null,
    canUndoReset: false,
    themeClass: ''
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    themeService.apply();
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

        // 只显示有目标或有资源数据的游戏
        if (targets.length > 0 || totalPulls > 0) {
          gamesData.push(gameData);
        }

        if (targets.length > 0) {
          const neededPulls = this._estimateNeededPulls(targets, resources, config);
          goalsData.push({
            ...gameData,
            targets,
            target: targets[0],
            neededPulls
          });
        }
      }

      // 只统计有目标的游戏
      const activeGames = gamesData.filter(g => g.target);
      const totalPulls = activeGames.reduce((sum, g) => sum + g.totalPulls, 0);

      const allocations = activeGames.map(g => ({
        gameId: g.gameId,
        gameName: g.name,
        currentPulls: g.totalPulls,
        originalPulls: g.totalPulls,
        probability: g.probability,
        probabilityText: formatProbability(g.probability),
        percentage: totalPulls > 0 ? Math.round((g.totalPulls / totalPulls) * 100) : 0,
        isPreview: false
      }));

      const avgProbability = activeGames.length > 0
        ? activeGames.reduce((s, g) => s + g.probability, 0) / activeGames.length
        : 0;
      const summaryText = `总资源: ${totalPulls}抽 | 目标: ${goalsData.length}个 | 平均达成率: ${formatProbability(avgProbability)}`;

      const achievableGoals = goalsData.filter(g => g.probability >= 0.8).length;
      const summaryBar = {
        totalPulls,
        totalGoals: goalsData.length,
        achievableGoals
      };

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
        summaryBar,
        conflicts: conflictsWithText,
        strategies,
        conflictDismissed: false,
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
    const conversionRate = config.conversionRate?.primaryToPull || config.conversionRate?.primogemsToFate || 160;
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
    const conversionRate = config.conversionRate?.primaryToPull || config.conversionRate?.primogemsToFate || 160;
    const resourceKeys = Object.keys(config.resources || {});
    if (resourceKeys.length === 0) return 0;
    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;
    const primaryValue = Number(resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;
    const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;
    if (totalPulls === 0) return 0;
    const target = { pulls: totalPulls, currentPity: 0 };
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

  _estimateNeededPulls(targets, resources, config) {
    if (!Array.isArray(targets)) {
      targets = targets ? [targets] : [];
    }
    let totalNeeded = 0;
    for (const target of targets) {
      const type = target.type || 'character';
      const rank = target.desiredRank || target.constellations || 0;
      // 武器池保底通常比角色池低
      const basePulls = type === 'weapon' ? 80 : (config.hardPity || 90);
      totalNeeded += basePulls * (rank + 1);
    }
    const currentPulls = this._calculateTotalPulls(resources, config);
    return Math.max(0, totalNeeded - currentPulls);
  },

  onAddGoal() {
    wx.navigateTo({
      url: '/pages/game-select/game-select'
    });
  },

  onGoalTap(e) {
    const { gameId } = e.detail;
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`
    });
  },

  onGoalMenu(e) {
    const { gameId } = e.detail;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/planning/planning?gameId=${gameId}&autoFocusTarget=true`
          });
        } else if (res.tapIndex === 1) {
          wx.showModal({
            title: '确认删除',
            content: '确定要删除该游戏的所有目标吗？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this._deleteAllGoals(gameId);
              }
            }
          });
        }
      }
    });
  },

  async _deleteAllGoals(gameId) {
    const result = await goalService.deleteAllGoals(gameId);
    if (result.success) {
      wx.showToast({ title: '已删除', icon: 'success' });
      this.loadData();
    } else {
      wx.showToast({ title: '删除失败', icon: 'none' });
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

      // 重新检测冲突（基于调整后的概率）
      const updatedGames = games.map(g => {
        const alloc = newAllocations.find(a => a.gameId === g.gameId);
        return { ...g, probability: alloc ? alloc.probability : g.probability };
      });
      const conflictResult = overviewService.detectConflicts(updatedGames);
      const newConflicts = conflictResult.success ? conflictResult.data : [];
      const conflictsWithText = newConflicts.map(c => ({
        ...c,
        probabilityText: formatProbability(c.probability)
      }));

      this.setData({
        allocations: newAllocations,
        lastAdjustmentHint: hint,
        previewingStrategyId: null,
        conflicts: conflictsWithText,
        conflictDismissed: false
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
          } else {
            wx.showToast({ title: '请输入有效数字', icon: 'none' });
          }
        }
      }
    });
  },

  onResetAllocation() {
    if (this.data.canUndoReset) {
      // 执行撤销
      this.setData({
        allocations: this.data.preResetAllocations,
        canUndoReset: false,
        lastAdjustmentHint: '已撤销重置'
      });
      if (this.data.undoTimer) {
        clearTimeout(this.data.undoTimer);
      }
      return;
    }

    const { originalAllocations, allocations } = this.data;
    if (!originalAllocations) return;

    // 保存重置前的状态
    this.setData({
      preResetAllocations: JSON.parse(JSON.stringify(allocations)),
      allocations: JSON.parse(JSON.stringify(originalAllocations)),
      lastAdjustmentHint: '已重置为原始分配（3秒内可撤销）',
      previewingStrategyId: null,
      canUndoReset: true
    });

    const timer = setTimeout(() => {
      this.setData({ canUndoReset: false });
    }, 3000);
    this.setData({ undoTimer: timer });
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
        lastAdjustmentHint: ''
      });

      wx.showToast({
        title: '已采用此方案',
        icon: 'success'
      });

      this.loadData();
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
  },

  onUnload() {
    if (this.data.undoTimer) {
      clearTimeout(this.data.undoTimer);
    }
  }
});