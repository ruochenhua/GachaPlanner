// components/reminder-setter/reminder-setter.js
// 提醒设置组件

const reminderService = require('../../services/reminder-service');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 卡池列表
    poolList: {
      type: Array,
      value: []
    },
    // 游戏ID
    gameId: {
      type: String,
      value: ''
    },
    // 游戏名称
    gameName: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件数据
   */
  data: {
    selectedPoolIndex: -1,
    selectedPoolId: '',
    selectedPoolName: '',
    openDate: '',
    advanceDays: 1,
    reminderTime: '09:00',
    todayDate: ''
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 设置今天日期为最小可选日期
      const today = new Date();
      this.setData({
        todayDate: today.toISOString().slice(0, 10)
      });
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 卡池选择变化
     */
    onPoolChange(e) {
      const index = e.detail.value;
      const pool = this.data.poolList[index];
      if (pool) {
        this.setData({
          selectedPoolIndex: index,
          selectedPoolId: pool.id,
          selectedPoolName: pool.name
        });
      }
    },

    /**
     * 日期选择变化
     */
    onDateChange(e) {
      this.setData({ openDate: e.detail.value });
    },

    /**
     * 提前天数变化
     */
    onAdvanceChange(e) {
      this.setData({ advanceDays: e.currentTarget.dataset.days });
    },

    /**
     * 时间选择变化
     */
    onTimeChange(e) {
      this.setData({ reminderTime: e.detail.value });
    },

    /**
     * 取消
     */
    onCancel() {
      this.triggerEvent('cancel');
    },

    /**
     * 确认保存
     */
    onConfirm() {
      const { selectedPoolId, selectedPoolName, openDate, advanceDays, reminderTime } = this.data;

      // 验证
      if (!selectedPoolId) {
        wx.showToast({ title: '请选择卡池', icon: 'none' });
        return;
      }
      if (!openDate) {
        wx.showToast({ title: '请选择开启日期', icon: 'none' });
        return;
      }

      // 计算提醒时间
      const reminderDateTime = this.calculateReminderDateTime(openDate, advanceDays, reminderTime);

      // 创建提醒
      const result = reminderService.createReminder({
        poolId: selectedPoolId,
        poolName: selectedPoolName,
        gameId: this.data.gameId,
        gameName: this.data.gameName,
        openDate,
        reminderTime: reminderDateTime,
        advanceDays
      });

      if (result.success) {
        wx.showToast({ title: '提醒已设置', icon: 'success' });
        this.triggerEvent('confirm', result.data);
      } else {
        wx.showToast({ title: result.error || '设置失败', icon: 'none' });
      }
    },

    /**
     * 计算提醒日期时间
     */
    calculateReminderDateTime(openDate, advanceDays, time) {
      const open = new Date(openDate);
      open.setDate(open.getDate() - advanceDays);
      const dateStr = open.toISOString().slice(0, 10);
      return `${dateStr} ${time}`;
    }
  }
});