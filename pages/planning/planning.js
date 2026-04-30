// pages/planning/planning.js
// 规划计算页面

const gameService = require('../../services/game-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const DynamicProbabilityCalculator = require('../../core/calculator/dynamic-probability-calculator');
const PlanningStorage = require('../../services/planning-storage');

Page({
  data: {
    gameId: '',
    gameName: '',
    resourceTypes: [],
    resources: {},
    // 版本信息
    dataVersion: '',
    updatedAt: '',
    isDataOutdated: false,
    daysSinceUpdate: 0,
    // 概率计算结果
    calculatedProbability: 0,
    calculatedDistribution: [],
    currentPulls: 0,
    currentPity: 0,
    isGuaranteed: false,  // 是否处于大保底状态
    // 游戏配置
    gameConfig: null,
    // 卡池时间设置
    poolStartDate: '',
    poolEndDate: '',
    dailyIncome: 0,
    otherIncome: 0,
    poolDays: 0,
    remainingDays: 0,
    // 动态概率预测
    probabilityTimeline: [],
    optimalWaitDays: 0,
    waitAdvice: '',
    showPoolSettings: false,
    // 最终抽数（卡池结束时的总抽数）
    finalPulls: 0,
    // 目标设定
    targets: []
  },

  onLoad(options) {
    // 页面加载时不做处理，等待 onShow 中根据 gameId 初始化
  },

  onShow() {
    // 从全局数据获取 gameId
    const app = getApp();
    const gameId = app.globalData.selectedGameId || 'genshin';

    // 如果 gameId 没变，不重新加载
    if (this.data.gameId === gameId && this.data.gameName) {
      return;
    }

    // 获取游戏配置
    const configResult = gameService.getGameConfig(gameId);
    if (!configResult.success) {
      console.error('配置加载失败');
      return;
    }

    const config = configResult.data;

    // 【新增】先加载持久化的规划数据
    this.loadPlanningData(gameId, config);
  },

  /**
   * 加载规划数据（持久化）
   * @param {string} gameId - 游戏 ID
   * @param {Object} config - 游戏配置
   */
  async loadPlanningData(gameId, config) {
    try {
      const result = await PlanningStorage.loadPlanningData(gameId);

      if (!result.success) {
        console.warn('规划数据加载失败，使用默认数据');
      }

      const data = result.data || {};
      const resources = data.resources || {};
      const poolTimeRange = data.poolTimeRange || {};
      const dailyIncomeData = data.dailyIncome || {};

      // 构建资源类型列表
      const resourceTypes = Object.keys(config.resources).map(key => ({
        key,
        name: config.resources[key].name,
        icon: config.resources[key].icon,
        max: 100000,
        step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
      }));

      // 计算版本信息
      const versionInfo = this.calculateVersionInfo(config.updatedAt);

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
        // 卡池时间
        poolStartDate: poolTimeRange.startDate || '',
        poolEndDate: poolTimeRange.endDate || '',
        // 每日收入
        dailyIncome: dailyIncomeData.primogems || 0,
        otherIncome: dailyIncomeData.events || 0,
        // 目标（暂不处理）
        targets: data.targets || []
      });

      console.log('规划数据加载完成:', {
        gameId,
        hasResources: Object.keys(resources).length > 0,
        hasPoolTime: !!poolTimeRange.startDate,
        hasDailyIncome: dailyIncomeData.primogems > 0
      });

      // 初始化概率计算
      this.calculateProbability();
    } catch (err) {
      console.error('规划数据加载异常:', err);
      // 异常时使用默认数据初始化
      this.initializeWithDefault(config);
    }
  },

  /**
   * 使用默认数据初始化
   * @param {Object} config - 游戏配置
   */
  initializeWithDefault(config) {
    const resourceTypes = Object.keys(config.resources).map(key => ({
      key,
      name: config.resources[key].name,
      icon: config.resources[key].icon,
      max: 100000,
      step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
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
      daysSinceUpdate: versionInfo.daysSinceUpdate
    });

    // 初始化概率计算
    this.calculateProbability();
  },

  /**
   * 计算版本信息
   * @param {string} updatedAt - 更新日期（YYYY-MM-DD）
   * @returns {Object} 版本信息 {isOutdated, daysSinceUpdate}
   */
  calculateVersionInfo(updatedAt) {
    try {
      const updateDate = new Date(updatedAt);
      const currentDate = new Date();
      const diffTime = currentDate - updateDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        isOutdated: diffDays > 30,
        daysSinceUpdate: diffDays
      };
    } catch (err) {
      console.error('版本信息计算失败:', err);
      return {
        isOutdated: false,
        daysSinceUpdate: 0
      };
    }
  },

  /**
   * 【新增】保存规划数据（持久化）
   */
  async savePlanningData() {
    try {
      const { gameId, resources, poolStartDate, poolEndDate, dailyIncome, otherIncome, targets } = this.data;

      const dataToSave = {
        resources,
        poolTimeRange: {
          startDate: poolStartDate,
          endDate: poolEndDate
        },
        dailyIncome: {
          primogems: dailyIncome,
          events: otherIncome
        },
        targets: targets || []
      };

      const result = await PlanningStorage.savePlanningData(gameId, dataToSave);

      if (result.success) {
        console.log('✓ 规划数据已自动保存');
      } else {
        console.warn('规划数据保存失败:', result.error);
      }
    } catch (err) {
      console.error('规划数据保存异常:', err);
    }
  },

  onResourceChange(e) {
    const { key, value } = e.detail;
    console.log('=== onResourceChange ===');
    console.log('key:', key, 'value:', value);

    const resources = { ...this.data.resources };
    resources[key] = value;
    this.setData({ resources });

    console.log('更新后的 resources:', resources);

    // 实时计算概率
    this.calculateProbability();

    // 【新增】防抖保存规划数据
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      // 保存到 gameService（兼容旧数据）
      const result = gameService.updateResources(this.data.gameId, this.data.resources);
      if (result.success) {
        console.log('✓ 资源已自动保存（gameService）');

        // 通知首页刷新数据
        const pages = getCurrentPages();
        const indexPage = pages.find(p => p.route === 'pages/index/index');
        if (indexPage && indexPage.loadData) {
          indexPage.loadData();
          console.log('✓ 已通知首页刷新数据');
        }
      }

      // 保存到 PlanningStorage（新增持久化）
      this.savePlanningData();
    }, 300);
  },

  /**
   * 当前抽数变化
   */
  onCurrentPityChange(e) {
    const currentPity = parseInt(e.detail.value) || 0;
    // 限制在保底范围内
    const maxPity = this.data.gameConfig?.hardPity || 90;
    const clampedPity = Math.min(currentPity, maxPity);
    this.setData({ currentPity: clampedPity });
    this.calculateProbability();
  },

  /**
   * 大保底状态变化
   */
  onGuaranteedChange(e) {
    const isGuaranteed = e.detail.value;
    this.setData({ isGuaranteed });
    this.calculateProbability();
  },

  /**
   * 计算概率分布
   * 根据当前资源和游戏配置计算达成概率
   */
  calculateProbability() {
    console.log('=== calculateProbability ===');
    const { resources, gameConfig, currentPity, isGuaranteed } = this.data;

    console.log('resources:', resources);
    console.log('gameConfig:', gameConfig ? '已加载' : '未加载');
    console.log('currentPity:', currentPity, 'isGuaranteed:', isGuaranteed);

    // 验证游戏配置
    if (!gameConfig) {
      console.warn('游戏配置未加载，跳过概率计算');
      return;
    }

    // 验证资源对象
    if (!resources || typeof resources !== 'object') {
      console.warn('资源数据无效，显示默认值');
      this.setData({
        calculatedProbability: 0,
        calculatedDistribution: [],
        currentPulls: 0
      });
      return;
    }

    try {
      // 计算总抽数
      const conversionRate = gameConfig.conversionRate?.primogemsToFate
        || gameConfig.conversionRate?.stellarJadeToPass
        || 160;

      // 验证转换率
      if (conversionRate <= 0) {
        console.error('转换率无效:', conversionRate);
        return;
      }

      const resourceKeys = Object.keys(gameConfig.resources);
      const primaryResourceKey = resourceKeys[0];
      const secondaryResourceKey = resourceKeys[1] || null;

      // 使用 Number() 确保类型转换
      const primaryValue = Number(resources[primaryResourceKey]) || 0;
      const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;

      const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;

      console.log('计算参数:', {
        primaryResourceKey,
        secondaryResourceKey,
        primaryValue,
        secondaryValue,
        conversionRate,
        totalPulls
      });

      if (totalPulls === 0) {
        console.log('总抽数为 0，设置默认值');
        this.setData({
          calculatedProbability: 0,
          calculatedDistribution: [],
          currentPulls: 0
        });
        return;
      }

      // 构建计算参数（包含保底状态）
      const target = {
        pulls: Math.min(totalPulls, gameConfig.hardPity || 90),
        currentPity: Number(currentPity) || 0,
        isGuaranteed: isGuaranteed || false  // 大保底状态
      };

      // 创建计算器并计算
      const calculator = CalculatorFactory.createCalculator(gameConfig);
      const result = calculator.calculate({
        resources,
        target,
        config: gameConfig
      });

      console.log('计算器结果:', result.success ? '成功' : '失败', result.data ? `data.length=${result.data.length}` : 'no data');

      if (result.success && result.data && result.data.length > 0) {
        const distribution = result.data;
        const finalProbability = distribution[distribution.length - 1].cumulativeProbability;

        // 转换 distribution 格式以适配 probability-chart 组件，过滤无效数据
        const chartDistribution = distribution
          .filter(item => item.pull !== undefined && item.cumulativeProbability !== undefined)
          .map(item => ({
            pulls: item.pull,
            probability: item.cumulativeProbability
          }));

        console.log('=== 设置概率数据 ===');
        console.log('finalProbability:', finalProbability, '转为百分比:', Math.round(finalProbability * 100) + '%');
        console.log('currentPulls:', totalPulls);
        console.log('chartDistribution.length:', chartDistribution.length);

        // 立即执行 setData 并打印结果
        this.setData({
          calculatedProbability: finalProbability,
          calculatedDistribution: chartDistribution,
          currentPulls: totalPulls
        });

        // 验证 setData 后的值
        console.log('setData 完成，验证当前 data.calculatedProbability:', this.data.calculatedProbability);

        console.log('概率计算完成:', {
          totalPulls,
          finalProbability: Math.round(finalProbability * 100) + '%',
          distributionPoints: distribution.length
        });

        // 如果设置了卡池时间，计算动态概率
        if (this.data.poolStartDate && this.data.poolEndDate) {
          this.calculateDynamicProbability();
        }
      } else {
        // 计算失败，显示错误状态
        console.error('概率计算失败:', result.error || '未知错误');
        this.setData({
          calculatedProbability: 0,
          calculatedDistribution: []
        });
      }
    } catch (err) {
      console.error('概率计算异常:', err);
      // 异常时重置为安全状态
      this.setData({
        calculatedProbability: 0,
        calculatedDistribution: []
      });
    }
  },

  /**
   * 切换卡池设置显示
   */
  togglePoolSettings() {
    this.setData({
      showPoolSettings: !this.data.showPoolSettings
    });
  },

  /**
   * 卡池开始日期变化
   */
  onPoolStartDateChange(e) {
    const poolStartDate = e.detail.value;
    this.setData({ poolStartDate });

    if (this.data.poolEndDate) {
      this.calculatePoolDays();
      this.calculateDynamicProbability();
      // 【新增】保存规划数据
      this.savePlanningData();
    }
  },

  /**
   * 卡池结束日期变化
   */
  onPoolEndDateChange(e) {
    const poolEndDate = e.detail.value;
    this.setData({ poolEndDate });

    if (this.data.poolStartDate) {
      this.calculatePoolDays();
      this.calculateDynamicProbability();
      // 【新增】保存规划数据
      this.savePlanningData();
    }
  },

  /**
   * 每日收入变化
   */
  onDailyIncomeChange(e) {
    const dailyIncome = parseInt(e.detail.value) || 0;
    this.setData({ dailyIncome });

    if (this.data.poolStartDate && this.data.poolEndDate) {
      this.calculateDynamicProbability();
      // 【新增】保存规划数据
      this.savePlanningData();
    }
  },

  /**
   * 其他资源获取变化（活动、探索等）
   */
  onOtherIncomeChange(e) {
    const otherIncome = parseInt(e.detail.value) || 0;
    this.setData({ otherIncome });

    if (this.data.poolStartDate && this.data.poolEndDate) {
      this.calculateDynamicProbability();
      // 【新增】保存规划数据
      this.savePlanningData();
    }
  },

  /**
   * 计算卡池持续天数
   */
  calculatePoolDays() {
    const { poolStartDate, poolEndDate } = this.data;
    if (!poolStartDate || !poolEndDate) {
      this.setData({ poolDays: 0, remainingDays: 0 });
      return;
    }

    const poolDays = this.calculateDaysBetween(poolStartDate, poolEndDate);

    // 计算剩余天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(poolEndDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    this.setData({ poolDays, remainingDays });
  },

  /**
   * 计算两个日期之间的天数
   */
  calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  /**
   * 计算动态概率预测
   */
  calculateDynamicProbability() {
    const { resources, gameConfig, poolStartDate, poolEndDate, dailyIncome, otherIncome, currentPulls } = this.data;

    if (!gameConfig || !poolStartDate || !poolEndDate) {
      return;
    }

    try {
      const result = DynamicProbabilityCalculator.calculateDynamicProbability(
        resources,
        gameConfig,
        { poolStartDate, poolEndDate, dailyIncome, otherIncome }
      );

      // 计算最终抽数（当前抽数 + 卡池期间每日收入累积的抽数 + 其他一次性收入）
      const conversionRate = gameConfig.conversionRate?.primogemsToFate || 160;
      const dailyPulls = Math.floor((dailyIncome * result.poolDays) / conversionRate);
      const otherPulls = Math.floor(otherIncome / conversionRate);
      const finalPulls = currentPulls + dailyPulls + otherPulls;

      console.log('动态概率计算 - finalPulls:', {
        currentPulls,
        dailyIncome,
        otherIncome,
        poolDays: result.poolDays,
        conversionRate,
        dailyPulls,
        otherPulls,
        finalPulls
      });

      this.setData({
        probabilityTimeline: result.timeline,
        optimalWaitDays: result.optimalWaitDays,
        waitAdvice: result.waitAdvice,
        poolDays: result.poolDays,
        remainingDays: result.remainingDays,
        finalPulls: finalPulls
      });

      console.log('动态概率计算完成:', {
        poolDays: result.poolDays,
        optimalWaitDays: result.optimalWaitDays,
        waitAdvice: result.waitAdvice,
        finalPulls: finalPulls
      });
    } catch (err) {
      console.error('动态概率计算异常:', err);
      this.setData({
        probabilityTimeline: [],
        optimalWaitDays: 0,
        waitAdvice: '计算失败',
        finalPulls: 0
      });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
});
