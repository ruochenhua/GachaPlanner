const gameService = require('../../services/game-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const DynamicProbabilityCalculator = require('../../core/calculator/dynamic-probability-calculator');
const PlanningStorage = require('../../services/planning-storage');
const { formatProbability } = require('../../utils/format-probability');
const themeService = require('../../services/theme-service');

Page({
  data: {
    themeClass: '',
    gameId: '',
    gameName: '',
    resourceTypes: [],
    resources: {},
    dataVersion: '',
    updatedAt: '',
    isDataOutdated: false,
    daysSinceUpdate: 0,
    calculatedProbability: 0,
    calculatedDistribution: [],
    currentPulls: 0,
    neededPulls: 0,
    gameConfig: null,
    poolStartDate: '',
    poolEndDate: '',
    dailyIncome: 0,
    otherIncome: 0,
    poolDays: 0,
    remainingDays: 0,
    probabilityTimeline: [],
    optimalWaitDays: 0,
    waitAdvice: '',
    showPoolSettings: false,
    showProbabilityChart: false,
    finalPulls: 0,
    finalProbabilityText: '',
    resourceUnit: '原石',
    // 多目标
    targets: [],
    showTargetForm: false,
    targetEditMode: false,
    targetEditIndex: -1,
    targetForm: {
      id: '',
      name: '',
      type: 'character',
      desiredRank: 0,
      isGuaranteed: false,
      currentPity: 0,
      poolStartDate: '',
      poolEndDate: ''
    },
    targetTypeOptions: [],
    rankOptions: [0, 1, 2, 3, 4, 5, 6],
    targetSummary: [],
    targetProbabilities: []
  },

  onLoad(options) {
    if (options && options.autoFocusTarget === 'true') {
      this.setData({ showTargetForm: true });
    }
  },

  onReady() {
    if (this.data.showTargetForm) {
      setTimeout(() => {
        wx.createSelectorQuery()
          .select('#target-section')
          .boundingClientRect(rect => {
            if (rect) {
              wx.pageScrollTo({ scrollTop: rect.top, duration: 300 });
            }
          })
          .exec();
      }, 300);
    }
  },

  onShow() {
    themeService.apply();
    const app = getApp();
    const gameId = app.globalData.selectedGameId || 'genshin';

    if (this.data.gameId === gameId && this.data.gameName) {
      return;
    }

    const configResult = gameService.getGameConfig(gameId);
    if (!configResult.success) {
      return;
    }

    const config = configResult.data;
    this.loadPlanningData(gameId, config);
  },

  async loadPlanningData(gameId, config) {
    try {
      const result = await PlanningStorage.loadPlanningData(gameId);
      const data = result.data || {};
      const resources = data.resources || {};
      const poolTimeRange = data.poolTimeRange || {};
      const dailyIncomeData = data.dailyIncome || {};
      let targets = data.targets || [];

      // 兼容旧数据：补充缺失字段
      const getTypeLabel = (type) => targetTypeOptions.find(t => t.key === type)?.label || type;
      targets = targets.map(t => ({
        ...t,
        typeLabel: getTypeLabel(t.type),
        rankUnit: t.type === 'weapon' ? '精' : '命',
        currentPity: t.currentPity !== undefined ? t.currentPity : 0,
        isGuaranteed: t.isGuaranteed !== undefined ? t.isGuaranteed : false,
        desiredRank: t.desiredRank !== undefined ? t.desiredRank : (t.constellations || 0)
      }));

      // 资源类型
      const resourceTypes = Object.keys(config.resources).map(key => ({
        key,
        name: config.resources[key].name,
        icon: config.resources[key].icon,
        max: 100000,
        step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
      }));

      // 目标类型选项
      const targetTypes = config.targetTypes || { character: { label: '角色', maxRank: 6 } };
      const targetTypeOptions = Object.keys(targetTypes).map(key => ({
        key,
        label: targetTypes[key].label,
        maxRank: targetTypes[key].maxRank
      }));

      // 版本信息
      const versionInfo = this.calculateVersionInfo(config.updatedAt);

      // 资源单位
      const resourceUnit = resourceTypes[0]?.name || '原石';

      this.setData({
        gameId,
        gameName: config.name,
        resourceTypes,
        resources,
        gameConfig: config,
        dataVersion: config.version,
        updatedAt: config.updatedAt,
        isDataOutdated: versionInfo.isOutdated,
        daysSinceUpdate: versionInfo.daysSinceUpdate,
        poolStartDate: poolTimeRange.startDate || '',
        poolEndDate: poolTimeRange.endDate || '',
        dailyIncome: dailyIncomeData.primogems || 0,
        otherIncome: dailyIncomeData.events || 0,
        targets,
        targetTypeOptions,
        resourceUnit,
      });

      // 同步第一个目标的卡池时间到页面级
      if (targets.length > 0) {
        const firstTarget = targets[0];
        this.setData({
          poolStartDate: firstTarget.poolStartDate || '',
          poolEndDate: firstTarget.poolEndDate || ''
        });
      }

      this.calculateProbability();
    } catch (err) {
      this.initializeWithDefault(config);
    }
  },

  initializeWithDefault(config) {
    const resourceTypes = Object.keys(config.resources).map(key => ({
      key,
      name: config.resources[key].name,
      icon: config.resources[key].icon,
      max: 100000,
      step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
    }));

    const targetTypes = config.targetTypes || { character: { label: '角色', maxRank: 6 } };
    const targetTypeOptions = Object.keys(targetTypes).map(key => ({
      key,
      label: targetTypes[key].label,
      maxRank: targetTypes[key].maxRank
    }));

    const versionInfo = this.calculateVersionInfo(config.updatedAt);

    this.setData({
      gameId: this.data.gameId,
      gameName: config.name,
      resourceTypes,
      resources: {},
      gameConfig: config,
      dataVersion: config.version,
      updatedAt: config.updatedAt,
      isDataOutdated: versionInfo.isOutdated,
      daysSinceUpdate: versionInfo.daysSinceUpdate,
      targetTypeOptions
    });

    this.calculateProbability();
  },

  calculateVersionInfo(updatedAt) {
    try {
      const updateDate = new Date(updatedAt);
      const currentDate = new Date();
      const diffDays = Math.floor((currentDate - updateDate) / (1000 * 60 * 60 * 24));
      return { isOutdated: diffDays > 30, daysSinceUpdate: diffDays };
    } catch (err) {
      return { isOutdated: false, daysSinceUpdate: 0 };
    }
  },

  /* ========== 目标管理 ========== */

  onShowTargetForm() {
    const { targetTypeOptions, targets } = this.data;
    const defaultType = targetTypeOptions[0]?.key || 'character';
    const maxRank = targetTypeOptions.find(t => t.key === defaultType)?.maxRank || 6;
    const rankOptions = Array.from({ length: maxRank + 1 }, (_, i) => i);

    // 新目标默认值：有现有目标时复制首个目标的保底状态，否则默认 0/小保底
    const firstTarget = targets && targets.length > 0 ? targets[0] : null;

    this.setData({
      showTargetForm: true,
      targetEditMode: false,
      targetEditIndex: -1,
      targetForm: {
        id: '',
        name: '',
        type: defaultType,
        desiredRank: 0,
        isGuaranteed: firstTarget ? firstTarget.isGuaranteed : false,
        currentPity: firstTarget ? firstTarget.currentPity : 0,
        poolStartDate: this.data.poolStartDate || '',
        poolEndDate: this.data.poolEndDate || ''
      },
      rankOptions
    });
  },

  onEditTarget(e) {
    const index = e.currentTarget.dataset.index;
    const { targets, targetTypeOptions } = this.data;
    const target = targets[index];
    if (!target) return;

    const targetType = target.type || 'character';
    const maxRank = targetTypeOptions.find(t => t.key === targetType)?.maxRank || 6;
    const rankOptions = Array.from({ length: maxRank + 1 }, (_, i) => i);

    this.setData({
      showTargetForm: true,
      targetEditMode: true,
      targetEditIndex: index,
      targetForm: {
        id: target.id || '',
        name: target.name || '',
        type: targetType,
        desiredRank: target.desiredRank !== undefined ? target.desiredRank : (target.constellations || 0),
        isGuaranteed: target.isGuaranteed !== undefined ? target.isGuaranteed : false,
        currentPity: target.currentPity !== undefined ? target.currentPity : 0,
        poolStartDate: target.poolStartDate || '',
        poolEndDate: target.poolEndDate || ''
      },
      rankOptions
    });
  },

  onCancelTargetForm() {
    this.setData({
      showTargetForm: false,
      targetEditMode: false,
      targetEditIndex: -1
    });
  },

  onDeleteTargetChip(e) {
    const index = e.currentTarget.dataset.index;
    const { targets } = this.data;
    const newTargets = targets.filter((_, i) => i !== index);

    this.setData({ targets: newTargets });
    this.savePlanningData();
    this.calculateProbability();
  },

  async onSaveTarget() {
    const { gameId, targetForm, targets, targetEditMode, targetEditIndex } = this.data;
    const target = {
      ...targetForm,
      id: targetForm.id || `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      typeLabel: this.getTypeLabel(targetForm.type),
      rankUnit: targetForm.type === 'weapon' ? '精' : '命'
    };

    let newTargets;
    if (targetEditMode && targetEditIndex >= 0) {
      newTargets = targets.map((t, i) => i === targetEditIndex ? target : t);
    } else {
      // 检查同类型重复，提示但不阻止
      const sameType = targets.find(t => t.type === target.type);
      if (sameType) {
        wx.showToast({
          title: `已有一个${this.getTypeLabel(target.type)}目标`,
          icon: 'none',
          duration: 2000
        });
      }
      newTargets = [...targets, target];
    }

    this.setData({
      targets: newTargets,
      showTargetForm: false,
      targetEditMode: false,
      targetEditIndex: -1
    });

    // 同步卡池时间
    if (target.poolStartDate) {
      this.setData({ poolStartDate: target.poolStartDate });
    }
    if (target.poolEndDate) {
      this.setData({ poolEndDate: target.poolEndDate });
    }

    await this.savePlanningData();
    this.calculateProbability();

    wx.showToast({
      title: targetEditMode ? '目标已更新' : '目标已保存',
      icon: 'success'
    });
  },

  getTypeLabel(type) {
    const { targetTypeOptions } = this.data;
    return targetTypeOptions.find(t => t.key === type)?.label || type;
  },

  /* ========== 目标表单输入 ========== */

  onTargetNameChange(e) {
    this.setData({ 'targetForm.name': e.detail.value });
  },

  onTargetTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    const { targetTypeOptions } = this.data;
    const maxRank = targetTypeOptions.find(t => t.key === type)?.maxRank || 6;
    const rankOptions = Array.from({ length: maxRank + 1 }, (_, i) => i);

    this.setData({
      'targetForm.type': type,
      'targetForm.desiredRank': 0,
      rankOptions
    });
  },

  onTargetRankChange(e) {
    const rank = parseInt(e.currentTarget.dataset.rank, 10);
    this.setData({ 'targetForm.desiredRank': rank });
  },

  onTargetGuaranteedChange(e) {
    this.setData({ 'targetForm.isGuaranteed': e.detail.value });
    // 实时更新表单概率预览
    if (this.data.poolStartDate && this.data.poolEndDate) {
      this.calculateDynamicProbability();
    }
  },

  onTargetCurrentPityChange(e) {
    const currentPity = parseInt(e.detail.value) || 0;
    const type = this.data.targetForm.type || 'character';
    const typeConfig = this.data.gameConfig?.targetTypes?.[type] || {};
    const maxPity = typeConfig.hardPity || this.data.gameConfig?.hardPity?.count || this.data.gameConfig?.hardPity || 90;
    const clampedPity = Math.min(currentPity, maxPity);
    this.setData({ 'targetForm.currentPity': clampedPity });
  },

  onTargetPoolStartDateChange(e) {
    const poolStartDate = e.detail.value;
    this.setData({
      'targetForm.poolStartDate': poolStartDate,
      poolStartDate
    });
    if (this.data.poolEndDate || this.data.targetForm.poolEndDate) {
      this.calculatePoolDays();
      this.calculateDynamicProbability();
    }
  },

  onTargetPoolEndDateChange(e) {
    const poolEndDate = e.detail.value;
    this.setData({
      'targetForm.poolEndDate': poolEndDate,
      poolEndDate
    });
    if (this.data.poolStartDate || this.data.targetForm.poolStartDate) {
      this.calculatePoolDays();
      this.calculateDynamicProbability();
    }
  },

  /* ========== 资源输入 ========== */

  onResourceChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = parseInt(e.detail.value) || 0;
    const resources = { ...this.data.resources, [key]: value };
    this.setData({ resources });
    this.calculateProbability();

    // 防抖保存
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      gameService.updateResources(this.data.gameId, this.data.resources);
      this.savePlanningData();
    }, 300);
  },

  /* ========== 概率计算 ========== */

  calculateProbability() {
    const { resources, gameConfig, targets } = this.data;

    if (!gameConfig) return;
    if (!resources || typeof resources !== 'object') {
      this.setData({
        calculatedProbability: 0,
        calculatedDistribution: [],
        currentPulls: 0,
        neededPulls: 0,
        probabilityText: '0.0%',
        targetSummary: []
      });
      return;
    }

    try {
      // 计算总抽数
      const conversionRate = gameConfig.conversionRate?.primaryToPull || 160;
      const resourceKeys = Object.keys(gameConfig.resources);
      const primaryKey = resourceKeys[0];
      const secondaryKey = resourceKeys[1] || null;
      const primaryValue = Number(resources[primaryKey]) || 0;
      const secondaryValue = secondaryKey ? (Number(resources[secondaryKey]) || 0) : 0;
      const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;

      // 计算每个目标的 neededPulls
      let totalNeededPulls = 0;
      const targetSummary = [];

      for (const target of targets) {
        const rank = target.desiredRank || target.constellations || 0;
        const basePulls = target.type === 'weapon' ? 80 : (gameConfig.hardPity?.count || 90);
        const needed = basePulls * (rank + 1);
        totalNeededPulls += needed;

        const typeLabel = this.getTypeLabel(target.type);
        const rankUnit = target.type === 'weapon' ? '精' : '命';
        targetSummary.push(`${target.name} ${rank}${rankUnit}`);
      }

      // 概率计算：分别计算每个目标的达成概率
      let finalProbability = 0;
      let chartDistribution = [];
      const targetProbabilities = [];

      if (totalPulls > 0 && targets.length > 0) {
        // 为每个目标单独计算概率（使用各自的卡池参数和大保底状态）
        for (const target of targets) {
          const typeConfig = gameConfig.targetTypes?.[target.type] || {};
          const targetHardPity = typeConfig.hardPity || gameConfig.hardPity?.count || gameConfig.hardPity || 90;
          const targetGuaranteeRate = typeConfig.guaranteeRate || gameConfig.guarantee?.rate || gameConfig.guaranteeRate || 0.5;

          // 为该目标创建临时配置（覆盖 hardPity 和 guaranteeRate）
          const targetConfig = {
            ...gameConfig,
            hardPity: { count: targetHardPity },
            guarantee: { ...gameConfig.guarantee, rate: targetGuaranteeRate }
          };

          const calcTarget = {
            pulls: totalPulls,
            currentPity: Number(target.currentPity) || 0,
            isGuaranteed: target.isGuaranteed || false
          };

          const calculator = CalculatorFactory.createCalculator(targetConfig);
          const result = calculator.calculate({ resources, target: calcTarget, config: targetConfig });

          let targetProb = 0;
          if (result.success && result.data && result.data.length > 0) {
            targetProb = result.data[result.data.length - 1].cumulativeProbability;
          }

          targetProbabilities.push({
            name: target.name,
            type: target.type,
            probability: targetProb,
            probabilityText: formatProbability(targetProb),
            isGuaranteed: target.isGuaranteed || false
          });
        }

        // 最终概率取最低值（所有目标都要达成）
        const minProb = targetProbabilities.length > 0
          ? Math.min(...targetProbabilities.map(t => t.probability))
          : 0;
        finalProbability = minProb;

        // 图表分布使用第一个目标的分布（或最低概率目标的分布）
        const firstTarget = targets[0];
        const firstTypeConfig = gameConfig.targetTypes?.[firstTarget.type] || {};
        const firstConfig = {
          ...gameConfig,
          hardPity: { count: firstTypeConfig.hardPity || gameConfig.hardPity?.count || gameConfig.hardPity || 90 },
          guarantee: { ...gameConfig.guarantee, rate: firstTypeConfig.guaranteeRate || gameConfig.guarantee?.rate || gameConfig.guaranteeRate || 0.5 }
        };
        const firstCalcTarget = {
          pulls: totalPulls,
          currentPity: Number(firstTarget.currentPity) || 0,
          isGuaranteed: firstTarget.isGuaranteed || false
        };
        const firstCalculator = CalculatorFactory.createCalculator(firstConfig);
        const firstResult = firstCalculator.calculate({ resources, target: firstCalcTarget, config: firstConfig });
        if (firstResult.success && firstResult.data && firstResult.data.length > 0) {
          chartDistribution = firstResult.data
            .filter(item => item.pull !== undefined && item.cumulativeProbability !== undefined)
            .map(item => ({ pulls: item.pull, probability: item.cumulativeProbability }));
        }
      }

      this.setData({
        calculatedProbability: finalProbability,
        calculatedDistribution: chartDistribution,
        currentPulls: totalPulls,
        neededPulls: totalNeededPulls,
        probabilityText: formatProbability(finalProbability),
        targetSummary,
        targetProbabilities
      });

      if (this.data.poolStartDate && this.data.poolEndDate) {
        this.calculateDynamicProbability();
      }
    } catch (err) {
      this.setData({
        calculatedProbability: 0,
        calculatedDistribution: [],
        currentPulls: 0,
        neededPulls: 0,
        probabilityText: '0.0%'
      });
    }
  },

  /* ========== 攒抽预测 ========== */

  togglePoolSettings() {
    this.setData({ showPoolSettings: !this.data.showPoolSettings });
  },

  toggleProbabilityChart() {
    this.setData({ showProbabilityChart: !this.data.showProbabilityChart });
  },

  onDailyIncomeChange(e) {
    const dailyIncome = parseInt(e.detail.value) || 0;
    this.setData({ dailyIncome });
    if (this.data.poolStartDate && this.data.poolEndDate) {
      this.calculateDynamicProbability();
      this.savePlanningData();
    }
  },

  onOtherIncomeChange(e) {
    const otherIncome = parseInt(e.detail.value) || 0;
    this.setData({ otherIncome });
    if (this.data.poolStartDate && this.data.poolEndDate) {
      this.calculateDynamicProbability();
      this.savePlanningData();
    }
  },

  calculatePoolDays() {
    const { poolStartDate, poolEndDate } = this.data;
    if (!poolStartDate || !poolEndDate) {
      this.setData({ poolDays: 0, remainingDays: 0 });
      return;
    }
    const poolDays = this.calculateDaysBetween(poolStartDate, poolEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(poolEndDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    this.setData({ poolDays, remainingDays });
  },

  calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  },

  calculateDynamicProbability() {
    const { resources, gameConfig, poolStartDate, poolEndDate, dailyIncome, otherIncome, currentPulls } = this.data;

    if (!gameConfig || !poolStartDate || !poolEndDate) return;

    try {
      const result = DynamicProbabilityCalculator.calculateDynamicProbability(
        resources, gameConfig,
        { poolStartDate, poolEndDate, dailyIncome, otherIncome }
      );

      const conversionRate = gameConfig.conversionRate?.primaryToPull || 160;
      const dailyPulls = Math.floor((dailyIncome * result.poolDays) / conversionRate);
      const otherPulls = Math.floor(otherIncome / conversionRate);
      const finalPulls = currentPulls + dailyPulls + otherPulls;

      const timelineWithText = (result.timeline || []).map(item => ({
        ...item,
        probabilityText: formatProbability(item.probability)
      }));

      // 计算最终概率（使用首个目标的保底状态）
      let finalProbability = 0;
      if (finalPulls > 0 && targets.length > 0) {
        const firstTarget = targets[0];
        const target = {
          pulls: finalPulls,
          currentPity: Number(firstTarget.currentPity) || 0,
          isGuaranteed: firstTarget.isGuaranteed || false
        };
        const calculator = CalculatorFactory.createCalculator(gameConfig);
        const calcResult = calculator.calculate({ resources, target, config: gameConfig });
        if (calcResult.success && calcResult.data && calcResult.data.length > 0) {
          finalProbability = calcResult.data[calcResult.data.length - 1].cumulativeProbability;
        }
      }

      this.setData({
        probabilityTimeline: timelineWithText,
        optimalWaitDays: result.optimalWaitDays,
        waitAdvice: result.waitAdvice,
        poolDays: result.poolDays,
        remainingDays: result.remainingDays,
        finalPulls,
        finalProbabilityText: formatProbability(finalProbability)
      });
    } catch (err) {
      this.setData({
        probabilityTimeline: [],
        optimalWaitDays: 0,
        waitAdvice: '',
        finalPulls: 0,
        finalProbabilityText: '0.0%'
      });
    }
  },

  /* ========== 数据持久化 ========== */

  async savePlanningData() {
    try {
      const { gameId, resources, poolStartDate, poolEndDate, dailyIncome, otherIncome, targets } = this.data;

      const dataToSave = {
        resources,
        poolTimeRange: { startDate: poolStartDate, endDate: poolEndDate },
        dailyIncome: { primogems: dailyIncome, events: otherIncome },
        targets: targets || []
      };

      await PlanningStorage.savePlanningData(gameId, dataToSave);
    } catch (err) {
      // 静默处理
    }
  },

  onUnload() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
});
