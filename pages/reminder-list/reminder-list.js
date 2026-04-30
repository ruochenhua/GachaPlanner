// pages/reminder-list/reminder-list.js
// 提醒列表页面

const reminderService = require('../../services/reminder-service');

Page({
  /**
   * 页面数据
   */
  data: {
    activeTab: 'pool',
    poolReminders: [],
    hoardingReminders: []
  },

  /**
   * 生命周期
   */
  onLoad() {
    this.loadReminders();
  },

  onShow() {
    this.loadReminders();
  },

  /**
   * 加载提醒数据
   */
  loadReminders() {
    // 加载卡池提醒
    const poolResult = reminderService.getReminders();
    if (poolResult.success) {
      this.setData({ poolReminders: poolResult.data });
    }

    // 加载囤积提醒
    const hoardingResult = reminderService.getHoardingReminders();
    if (hoardingResult.success) {
      const reminders = hoardingResult.data.map(r => {
        const progress = reminderService.calculateProgress(r);
        return { ...r, ...progress };
      });
      this.setData({ hoardingReminders: reminders });
    }
  },

  /**
   * 标签切换
   */
  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  /**
   * 返回
   */
  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  },

  /**
   * 添加卡池提醒
   */
  onAddPoolReminder() {
    wx.showToast({
      title: '请在规划页面设置提醒',
      icon: 'none'
    });
  },

  /**
   * 编辑卡池提醒
   */
  onEditPoolReminder(e) {
    const id = e.currentTarget.dataset.id;
    const reminder = this.data.poolReminders.find(r => r.id === id);
    if (reminder) {
      wx.showModal({
        title: '提醒详情',
        content: `${reminder.gameName} - ${reminder.poolName}\n开启日期：${reminder.openDate}\n提醒时间：${reminder.reminderTime}`,
        showCancel: false
      });
    }
  },

  /**
   * 删除卡池提醒
   */
  onDeletePoolReminder(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个提醒吗？',
      success: (res) => {
        if (res.confirm) {
          const result = reminderService.deleteReminder(id);
          if (result.success) {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadReminders();
          } else {
            wx.showToast({ title: result.error || '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 添加囤积提醒
   */
  onAddHoardingReminder() {
    wx.showToast({
      title: '请在规划页面设置提醒',
      icon: 'none'
    });
  },

  /**
   * 编辑囤积提醒
   */
  onEditHoardingReminder(e) {
    const id = e.currentTarget.dataset.id;
    const reminder = this.data.hoardingReminders.find(r => r.id === id);
    if (reminder) {
      wx.showModal({
        title: '囤积提醒详情',
        content: `${reminder.gameName}\n当前：${reminder.currentResource}\n目标：${reminder.targetResource}\n进度：${reminder.progress}%`,
        showCancel: false
      });
    }
  },

  /**
   * 删除囤积提醒
   */
  onDeleteHoardingReminder(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个囤积提醒吗？',
      success: (res) => {
        if (res.confirm) {
          const result = reminderService.deleteHoardingReminder(id);
          if (result.success) {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadReminders();
          } else {
            wx.showToast({ title: result.error || '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});