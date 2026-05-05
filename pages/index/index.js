// pages/index/index.js
// 首页 - 资源总览页面

const gameService = require('../../services/game-service');
const CalculatorFactory = require('../../core/calculator/calculator-factory');
const CombinedProbabilityCalculator = require('../../core/calculator/combined-probability-calculator');
const themeService = require('../../services/theme-service');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    themeClass: '',
    totalResources: 0,           // 总抽数（正确的抽数统计）
    monthlyPlans: 0,             // 本月规划数量
    resourceDistribution: [],    // 资源分配数据
    games: [],                   // 游戏列表数据
    averageProbability: 0,       // 总体平均概率
    combinedProbability: 0,      // 综合达成概率
    optimalGameName: '',         // 最优游戏名称
    strategyAdvice: '',          // 策略建议
    loading: true                // 加载状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 加载页面数据
   */
  loadData() {

    try {
      // 1. 获取支持的游戏列表
      const supportedGames = gameService.getSupportedGames();

      // 2. 遍历游戏获取资源数据
      const gamesData = [];
      const probabilities = []; // 收集各游戏概率用于计算平均值

      supportedGames.forEach(gameId => {
        try {
          const configResult = gameService.getGameConfig(gameId);
          const resourcesResult = gameService.getGameResources(gameId);

          if (configResult.success) {
            const config = configResult.data;
            // 获取游戏资源数据
            let gameResources = {};
            if (resourcesResult.success && resourcesResult.data) {
              gameResources = resourcesResult.data;
            }

            // 计算真实概率
            const probability = this.calculateGameProbability(gameResources, config);
            probabilities.push(probability);

            // 计算该游戏的总抽数
            const conversionRate = config.conversionRate?.primaryToPull || 160;
            const resourceKeys = Object.keys(config.resources || {});
            let totalPulls = 0;
            if (resourceKeys.length > 0) {
              const primaryResourceKey = resourceKeys[0];
              const secondaryResourceKey = resourceKeys[1] || null;
              const primaryValue = Number(gameResources[primaryResourceKey]) || 0;
              const secondaryValue = secondaryResourceKey ? (Number(gameResources[secondaryResourceKey]) || 0) : 0;
              totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;
            }

            // 创建游戏数据对象
            const gameData = {
              gameId,
              name: config.name,
              icon: `/assets/images/games/${gameId}.png`,
              resources: gameResources,
              totalPulls,  // 添加总抽数字段
              probability: probability // 保持 0-1 小数，由组件格式化
            };

            gamesData.push(gameData);
          }
        } catch (gameError) {
          // 单个游戏加载出错，跳过继续处理其他游戏
          console.error(`✗ 游戏 ${gameId} 数据加载出错:`, gameError);
        }
      });


      // 3. 计算总抽数（正确转换）
      let totalPulls = 0;
      gamesData.forEach(game => {
        const gameConfig = gameService.getGameConfig(game.gameId);
        if (gameConfig.success) {
          const config = gameConfig.data;
          const conversionRate = config.conversionRate?.primaryToPull || 160;
          const resourceKeys = Object.keys(config.resources || {});

          if (resourceKeys.length > 0) {
            const primaryResourceKey = resourceKeys[0];
            const secondaryResourceKey = resourceKeys[1] || null;

            const primaryValue = Number(game.resources[primaryResourceKey]) || 0;
            const secondaryValue = secondaryResourceKey ? (Number(game.resources[secondaryResourceKey]) || 0) : 0;

            // 正确计算抽数：主资源/转换率 + 次资源
            totalPulls += Math.floor(primaryValue / conversionRate) + secondaryValue;
          }
        }
      });

      // 4. 计算资源分配比例（基于抽数）
      const resourceDistribution = [];
      gamesData.forEach(game => {
        const percentage = totalPulls > 0 ? ((game.totalPulls / totalPulls) * 100).toFixed(1) : 0;
        resourceDistribution.push({
          name: game.name,
          value: game.totalPulls,
          percentage
        });
      });

      // 5. 计算总体平均概率
      const averageProbability = probabilities.length > 0
        ? Math.round((probabilities.reduce((a, b) => a + b, 0) / probabilities.length) * 100)
        : 0;

      // 5.5. 计算综合概率和最优策略
      const gamesDataForCombined = gamesData.map(game => ({
        gameId: game.gameId,
        name: game.name,
        resources: game.resources,
        config: gameService.getGameConfig(game.gameId).data,
        probability: game.probability / 100 // 转回小数
      }));
      const combinedResult = CombinedProbabilityCalculator.calculateCombinedProbability(gamesDataForCombined);
      const strategyAdvice = CombinedProbabilityCalculator.generateStrategyAdvice(combinedResult);

      // 6. 更新页面数据
      this.setData({
        games: gamesData,
        totalResources: totalPulls,  // 使用正确的总抽数
        resourceDistribution,
        averageProbability,
        combinedProbability: Math.round(combinedResult.combinedProbability * 100),
        optimalGameName: combinedResult.optimalGameName || '',
        strategyAdvice,
        monthlyPlans: 3, // TODO: 后续从规划服务获取
        loading: false
      });



    } catch (error) {
      console.error('✗ 首页数据加载出错:', error);
      console.error('✗ 错误详情:', error.message, error.stack);

      // 【修复】静默处理错误，但保持原有数据，不清空
      // 确保 loading 状态关闭，但保留已加载的游戏数据
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 计算单个游戏的达成概率
   * @param {Object} resources - 资源数据
   * @param {Object} config - 游戏配置
   * @returns {number} 概率值 (0-1)
   */
  calculateGameProbability(resources, config) {
    try {
      // 验证输入
      if (!resources || typeof resources !== 'object' || !config) {
        return 0;
      }

      // 计算总抽数
      const conversionRate = config.conversionRate?.primaryToPull || 160;
      if (conversionRate <= 0) {
        console.error('转换率无效:', conversionRate);
        return 0;
      }

      const resourceKeys = Object.keys(config.resources || {});
      if (resourceKeys.length === 0) {
        return 0;
      }

      const primaryResourceKey = resourceKeys[0];
      const secondaryResourceKey = resourceKeys[1] || null;

      const primaryValue = Number(resources[primaryResourceKey]) || 0;
      const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;

      const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;

      if (totalPulls === 0) {
        return 0;
      }

      // 构建计算参数
      const target = {
        pulls: Math.min(totalPulls, config.hardPity?.count || 90),
        currentPity: 0
      };

      // 创建计算器并计算
      const calculator = CalculatorFactory.createCalculator(config);
      const result = calculator.calculate({
        resources,
        target,
        config
      });

      if (result.success && result.data && result.data.length > 0) {
        return result.data[result.data.length - 1].cumulativeProbability;
      }

      return 0;
    } catch (err) {
      console.error('概率计算异常:', err);
      return 0;
    }
  },

  /**
   * 游戏卡片点击事件
   */
  onGameCardTap(e) {
    const { gameId } = e.detail;

    // 保存选中的游戏ID到全局数据
    const app = getApp();
    app.globalData.selectedGameId = gameId;

    // 【修复】同步更新 gameService 的 currentGameId，确保数据一致
    gameService.currentGameId = gameId;


    // 【修复】使用 navigateTo 跳转到规划页（普通页面，可返回）
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`,
      success: () => {
      },
      fail: (err) => {
        console.error('✗ 跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    themeService.apply();
    // 页面显示时重新加载数据
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'GachaPlaner - 多游戏抽卡规划工具',
      path: '/pages/index/index'
    };
  }
})
