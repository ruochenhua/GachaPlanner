/**
 * 版本列表页面
 * 显示所有游戏的数据版本信息
 */

const gameService = require('../../services/game-service');
const dataExpiryChecker = require('../../utils/data-expiry-checker');

Page({
  data: {
    // 游戏版本列表
    gameVersions: [],
    // 是否正在加载
    loading: true,
    // 过期统计
    expirySummary: {
      total: 0,
      expired: 0,
      warning: 0,
      normal: 0
    }
  },

  onLoad() {
    this.loadGameVersions();
  },

  onShow() {
    this.loadGameVersions();
  },

  /**
   * 加载游戏版本信息
   */
  loadGameVersions() {
    this.setData({ loading: true });

    try {
      const gameConfigs = gameService.getGameConfigs();
      const gameVersions = [];

      Object.keys(gameConfigs).forEach(gameId => {
        const config = gameConfigs[gameId];
        const expiryResult = dataExpiryChecker.checkDataExpiry(config.updatedAt);
        const warningLevel = dataExpiryChecker.getExpiryWarningLevel(expiryResult);

        gameVersions.push({
          gameId,
          gameName: config.name,
          version: config.version || '1.0.0',
          updatedAt: config.updatedAt,
          expiryResult,
          warningLevel
        });
      });

      // 批量检测过期状态
      const configList = Object.values(gameConfigs);
      const { summary } = dataExpiryChecker.checkMultipleGamesExpiry(configList);

      this.setData({
        gameVersions,
        expirySummary: summary,
        loading: false
      });
    } catch (err) {
      console.error('加载游戏版本失败:', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 点击游戏项
   */
  onGameTap(e) {
    const { gameId } = e.currentTarget.dataset;
    // 跳转到游戏详情页
    wx.navigateTo({
      url: `/pages/game-detail/game-detail?gameId=${gameId}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadGameVersions();
    wx.stopPullDownRefresh();
  }
});