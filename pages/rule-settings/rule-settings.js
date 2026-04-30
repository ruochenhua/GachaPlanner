// pages/rule-settings/rule-settings.js
// 规则设置页面 - 用户自定义概率计算参数

const configLoader = require('../../config/config-loader');
const storageService = require('../../services/storage-service');
const gameService = require('../../services/game-service');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    gameId: '',
    gameName: '',
    isCustom: false,
    updatedAt: '',

    // 参数值
    baseRate: 0.006,
    hardPity: 90,
    softPityStart: 74,
    softPityIncrement: 0.06,

    // 参数范围
    baseRateRange: { min: 0.001, max: 0.1 },
    hardPityRange: { min: 1, max: 200 },
    softPityStartRange: { min: 1, max: 90 },
    softPityIncrementRange: { min: 0.01, max: 0.1 },

    // UI状态
    loading: true,
    saving: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const gameId = options.gameId || gameService.getCurrentGameId();
    this.setData({ gameId });
    this.loadSettings();
  },

  /**
   * 加载规则设置
   */
  loadSettings() {
    try {
      // 加载游戏基本信息
      const configResult = configLoader.loadOriginalGameConfig(this.data.gameId);
      if (!configResult.success) {
        console.error('加载游戏配置失败:', configResult.error);
        wx.showToast({
          title: '加载配置失败',
          icon: 'none'
        });
        return;
      }

      const config = configResult.data;
      this.setData({
        gameName: config.name,
        // 设置默认值范围上限
        softPityStartRange: { min: 1, max: config.hardPity - 1 }
      });

      // 加载用户自定义设置
      const customResult = storageService.loadCustomRuleSettings(this.data.gameId);
      if (customResult.success && customResult.data && customResult.data.isCustom) {
        // 使用自定义参数
        this.setData({
          baseRate: customResult.data.baseRate,
          hardPity: customResult.data.hardPity,
          softPityStart: customResult.data.softPityStart,
          softPityIncrement: customResult.data.softPityIncrement,
          isCustom: true,
          updatedAt: customResult.data.updatedAt,
          softPityStartRange: { min: 1, max: customResult.data.hardPity - 1 }
        });
        console.log('✓ 加载自定义规则设置');
      } else {
        // 使用默认参数
        this.setData({
          baseRate: config.baseRate,
          hardPity: config.hardPity,
          softPityStart: config.softPityStart,
          softPityIncrement: config.softPityIncrement,
          isCustom: false,
          updatedAt: config.updatedAt
        });
        console.log('✓ 加载默认规则设置');
      }

      this.setData({ loading: false });
    } catch (err) {
      console.error('加载规则设置异常:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 基础概率滑块变化
   */
  onBaseRateChange(e) {
    const value = parseFloat(e.detail.value);
    this.setData({ baseRate: value / 1000 }); // 滑块值转为实际概率
  },

  /**
   * 硬保底阈值滑块变化
   */
  onHardPityChange(e) {
    const value = parseInt(e.detail.value);
    const softPityStart = Math.min(this.data.softPityStart, value - 1);
    this.setData({
      hardPity: value,
      softPityStart,
      softPityStartRange: { min: 1, max: value - 1 }
    });
  },

  /**
   * 软保底起始滑块变化
   */
  onSoftPityStartChange(e) {
    const value = parseInt(e.detail.value);
    this.setData({ softPityStart: value });
  },

  /**
   * 软保底提升率滑块变化
   */
  onSoftPityIncrementChange(e) {
    const value = parseFloat(e.detail.value);
    this.setData({ softPityIncrement: value / 100 }); // 滑块值转为实际提升率
  },

  /**
   * 保存设置
   */
  onSave() {
    this.setData({ saving: true });

    const settings = {
      baseRate: this.data.baseRate,
      hardPity: this.data.hardPity,
      softPityStart: this.data.softPityStart,
      softPityIncrement: this.data.softPityIncrement,
      isCustom: true
    };

    const result = storageService.saveCustomRuleSettings(this.data.gameId, settings);

    if (result.success) {
      // 更新显示状态
      this.setData({
        isCustom: true,
        updatedAt: new Date().toISOString(),
        saving: false
      });

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      console.log('✓ 规则设置已保存');

      // 刷新首页和规划页的概率计算（通过返回触发）
    } else {
      wx.showToast({
        title: result.error || '保存失败',
        icon: 'none'
      });
      this.setData({ saving: false });
    }
  },

  /**
   * 重置为默认值
   */
  onReset() {
    wx.showModal({
      title: '确认重置',
      content: '将恢复为游戏默认规则参数',
      success: (res) => {
        if (res.confirm) {
          // 清除自定义设置
          const result = storageService.clearCustomRuleSettings(this.data.gameId);

          if (result.success) {
            // 重新加载默认值
            this.loadSettings();

            wx.showToast({
              title: '已重置',
              icon: 'success'
            });

            console.log('✓ 规则设置已重置');
          } else {
            wx.showToast({
              title: '重置失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 格式化概率显示
   */
  formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
  },

  /**
   * 格式化提升率显示
   */
  formatIncrement(value) {
    return (value * 100).toFixed(0) + '%';
  },

  /**
   * 格式化更新时间
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
});