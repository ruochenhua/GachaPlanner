// pages/overview/overview.js
// 总体规划页面 - 显示所有游戏的达成情况总览

const gameService = require('../../services/game-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const CombinedProbabilityCalculator = require('../../core/calculator/combined-probability-calculator');

Page({
  data: {
    games: [],                 // 所有游戏数据
    totalResources: 0,         // 总抽数（正确计算）
    averageProbability: 0,     // 平均达成概率
    combinedProbability: 0,    // 综合达成概率
    optimalGameName: '',       // 最优游戏名称
    strategyAdvice: '',        // 策略建议
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  /**
   * 加载所有游戏数据
   */
  loadData() {
    console.log('=== 总体规划页加载数据 ===');

    try {
      // 获取所有支持的游戏
      const supportedGames = gameService.getSupportedGames();
      console.log('支持的游戏:', supportedGames);

      // 遍历游戏获取数据和计算概率
      const gamesData = [];
      const probabilities = [];

      supportedGames.forEach(gameId => {
        const configResult = gameService.getGameConfig(gameId);
        const resourcesResult = gameService.getGameResources(gameId);

        if (configResult.success) {
          const config = configResult.data;
          let gameResources = {};

          if (resourcesResult.success && resourcesResult.data) {
            gameResources = resourcesResult.data;
          }

          // 计算该游戏的达成概率
          const probability = this.calculateGameProbability(gameResources, config);
          probabilities.push(probability);

          // 计算总抽数
          const totalPulls = this.calculateTotalPulls(gameResources, config);

          // 创建游戏数据对象
          const gameData = {
            gameId,
            name: config.name,
            icon: `/assets/images/games/${gameId}.png`,
            resources: gameResources,
            totalPulls,
            probability: Math.round(probability * 100),
            config
          };

          gamesData.push(gameData);
          console.log(`✓ ${config.name} 数据加载成功，概率: ${Math.round(probability * 100)}%`);
        }
      });

      // 计算平均概率
      const averageProbability = probabilities.length > 0
        ? probabilities.reduce((a, b) => a + b, 0) / probabilities.length
        : 0;

      // 计算综合概率
      const combinedResult = CombinedProbabilityCalculator.calculateCombinedProbability(
        gamesData.map(game => ({
          gameId: game.gameId,
          name: game.name,
          resources: game.resources,
          config: game.config,
          probability: game.probability / 100
        }))
      );

      const strategyAdvice = CombinedProbabilityCalculator.generateStrategyAdvice(combinedResult);

      // 计算总资源
      let totalResources = 0;
      gamesData.forEach(game => {
        totalResources += game.totalPulls;
      });

      this.setData({
        games: gamesData,
        totalResources,
        averageProbability: Math.round(averageProbability * 100),
        combinedProbability: Math.round(combinedResult.combinedProbability * 100),
        optimalGameName: combinedResult.optimalGameName || '',
        strategyAdvice,
        loading: false
      });

      console.log('✓ 总体规划数据加载完成');
      console.log('  - 平均概率:', Math.round(averageProbability * 100) + '%');
      console.log('  - 综合概率:', Math.round(combinedResult.combinedProbability * 100) + '%');

    } catch (err) {
      console.error('加载数据失败:', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 计算游戏达成概率
   */
  calculateGameProbability(resources, config) {
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

    // 构建计算参数
    const target = {
      pulls: Math.min(totalPulls, config.hardPity || 90),
      currentPity: 0
    };

    try {
      const calculator = CalculatorFactory.createCalculator(config);
      const result = calculator.calculate({
        resources,
        target,
        config
      });

      if (result.success && result.data && result.data.length > 0) {
        return result.data[result.data.length - 1].cumulativeProbability;
      }
    } catch (err) {
      console.error('概率计算异常:', err);
    }

    return 0;
  },

  /**
   * 计算总抽数
   */
  calculateTotalPulls(resources, config) {
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

  /**
   * 跳转到游戏规划页
   */
  onGameTap(e) {
    const { gameId } = e.currentTarget.dataset;

    // 设置当前游戏
    const app = getApp();
    app.globalData.selectedGameId = gameId;
    gameService.currentGameId = gameId;

    // 【修复】使用 navigateTo 跳转到规划页（普通页面，可返回）
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});