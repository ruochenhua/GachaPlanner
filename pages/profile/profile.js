// pages/profile/profile.js
// 个人中心页面

const storageService = require('../../services/storage-service');
const gameService = require('../../services/game-service');

Page({
  data: {
    // 页面数据
    currentGameName: ''
  },

  onLoad() {
    console.log('=== 个人中心页加载 ===');
    this.loadCurrentGame();
  },

  onShow() {
    this.loadCurrentGame();
  },

  /**
   * 加载当前游戏信息
   */
  loadCurrentGame() {
    const gameId = gameService.getCurrentGameId();
    const configResult = gameService.getGameConfig(gameId);
    if (configResult.success) {
      this.setData({
        currentGameName: configResult.data.name
      });
    }
  },

  /**
   * 规则设置按钮点击事件
   */
  onRuleSettings() {
    console.log('点击规则设置按钮');
    const gameId = gameService.getCurrentGameId();
    wx.navigateTo({
      url: `/pages/rule-settings/rule-settings?gameId=${gameId}`,
      success: () => {
        console.log('✓ 跳转规则设置页成功');
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
   * 配置管理按钮点击事件
   */
  onConfigManager() {
    console.log('点击配置管理按钮');
    const gameId = gameService.getCurrentGameId();
    wx.navigateTo({
      url: `/pages/config-manager/config-manager?gameId=${gameId}`,
      success: () => {
        console.log('✓ 跳转配置管理页成功');
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
   * 清除数据按钮点击事件
   */
  onClearData() {
    console.log('点击清除数据按钮');

    wx.showModal({
      title: '确认清除',
      content: '清除后所有游戏数据将被删除且无法恢复，确定要清除吗？',
      confirmText: '确定清除',
      confirmColor: '#C47070',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认清除数据');
          this.clearAllData();
        } else {
          console.log('用户取消清除数据');
        }
      }
    });
  },

  /**
   * 执行清除数据
   */
  clearAllData() {
    console.log('开始清除数据...');

    storageService.clearAllData().then(result => {
      if (result.success) {
        console.log('✓ 数据清除成功');
        wx.showToast({
          title: '数据已清除',
          icon: 'success',
          duration: 2000
        });

        // 通知首页刷新
        this.notifyHomePage();

        // 延迟后跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 2000);
      } else {
        console.error('✗ 数据清除失败:', result.error);
        wx.showToast({
          title: '清除失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 通知首页刷新
   */
  notifyHomePage() {
    const pages = getCurrentPages();
    const indexPage = pages.find(p => p.route === 'pages/index/index');
    if (indexPage && indexPage.loadData) {
      console.log('通知首页刷新数据');
      indexPage.loadData();
    }
  }
});
