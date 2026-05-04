// pages/config-manager/config-manager.js
// 配置管理页面 - 导出、导入、分享配置

const configExportService = require('../../services/config-export-service');
const gameService = require('../../services/game-service');
const themeService = require('../../services/theme-service');

Page({
  data: {
    themeClass: '',
    gameId: '',
    gameName: '',
    configPreview: null,
    importPreview: null,
    loading: false,
    activeTab: 'export'  // export, import
  },

  onLoad(options) {
    const gameId = options.gameId || gameService.getCurrentGameId();
    this.setData({ gameId });
    this.loadConfigPreview();
  },

  onShow() {
    themeService.apply();
  },

  /**
   * 加载配置预览
   */
  loadConfigPreview() {
    const configResult = gameService.getGameConfig(this.data.gameId);
    if (configResult.success) {
      const config = configResult.data;
      this.setData({
        gameName: config.name,
        configPreview: {
          baseRate: (config.baseRate * 100).toFixed(1) + '%',
          hardPity: config.hardPity + '抽',
          softPityStart: config.softPityStart + '抽',
          softPityIncrement: (config.softPityIncrement * 100).toFixed(0) + '%',
          guaranteeRate: config.guaranteeRate ? (config.guaranteeRate * 100) + '%' : '无',
          isCustom: config._isCustom || false
        }
      });
    }
  },

  /**
   * 切换标签页
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  /**
   * 导出配置到剪贴板
   */
  async onExportToClipboard() {
    this.setData({ loading: true });

    const result = configExportService.shareConfigToClipboard(this.data.gameId);

    this.setData({ loading: false });

    if (result.success) {
      wx.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.error || '导出失败',
        icon: 'none'
      });
    }
  },

  /**
   * 导出配置到文件
   */
  onExportToFile() {
    configExportService.saveConfigToFile(this.data.gameId);
  },

  /**
   * 从剪贴板导入
   */
  async onImportFromClipboard() {
    this.setData({ loading: true });

    const result = await configExportService.importConfigFromClipboard();

    this.setData({ loading: false });

    if (result.success) {
      // 显示导入预览
      this.setData({
        importPreview: {
          gameId: result.data.gameId,
          name: result.data.name,
          config: result.data.config
        }
      });

      wx.showModal({
        title: '导入确认',
        content: `即将导入 ${result.data.name} 的配置，是否继续？`,
        success: (res) => {
          if (res.confirm) {
            this.applyImportedConfig();
          }
        }
      });
    } else {
      wx.showToast({
        title: result.error || '导入失败',
        icon: 'none'
      });
    }
  },

  /**
   * 应用导入的配置
   */
  applyImportedConfig() {
    if (!this.data.importPreview) return;

    // 刷新配置
    this.setData({ gameId: this.data.importPreview.gameId });
    this.loadConfigPreview();

    wx.showToast({
      title: '导入成功',
      icon: 'success'
    });

    // 清空预览
    this.setData({ importPreview: null });
  },

  /**
   * 分享配置给好友
   */
  onShareAppMessage() {
    return {
      title: `${this.data.gameName} 概率计算配置`,
      path: `/pages/index/index`,
      imageUrl: '/assets/images/share-config.png'
    };
  },

  /**
   * 重置为默认配置
   */
  onResetConfig() {
    wx.showModal({
      title: '确认重置',
      content: '将恢复为游戏默认配置，自定义参数将丢失',
      success: (res) => {
        if (res.confirm) {
          const result = gameService.clearCustomRuleSettings(this.data.gameId);
          if (result.success) {
            this.loadConfigPreview();
            wx.showToast({
              title: '已重置',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  /**
   * 查看配置详情
   */
  onViewConfigDetail() {
    const exportResult = configExportService.exportGameConfig(this.data.gameId);
    if (exportResult.success) {
      // 显示完整配置JSON
      wx.showModal({
        title: '配置详情',
        content: exportResult.data.json.substring(0, 200) + '...',
        showCancel: false
      });
    }
  }
});