// components/hoarding-reminder/hoarding-reminder.js
// 囤积提醒组件

const reminderService = require('../../services/reminder-service');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 提醒数据
    reminderData: {
      type: Object,
      value: null
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
    targetResource: 160,
    currentResource: 80,
    reminderThreshold: 150,
    periodicReminder: 'none',
    progress: 0,
    remaining: 80,
    progressColor: 'warning'
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      if (this.data.reminderData) {
        this.initFromData(this.data.reminderData);
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 从提醒数据初始化
     */
    initFromData(data) {
      const progressInfo = reminderService.calculateProgress(data);
      this.setData({
        targetResource: data.targetResource,
        currentResource: data.currentResource,
        reminderThreshold: data.reminderThreshold,
        periodicReminder: data.periodicReminder || 'none',
        progress: progressInfo.progress,
        remaining: progressInfo.remaining,
        progressColor: progressInfo.progressColor
      });
    },

    /**
     * 阈值输入
     */
    onThresholdInput(e) {
      this.setData({ reminderThreshold: parseInt(e.detail.value) || 0 });
    },

    /**
     * 定期提醒选择
     */
    onPeriodicChange(e) {
      this.setData({ periodicReminder: e.currentTarget.dataset.value });
    },

    /**
     * 更新资源
     */
    onUpdateResource() {
      // 打开资源输入
      this.triggerEvent('update', {
        reminderId: this.data.reminderData?.id,
        gameId: this.data.gameId
      });
    },

    /**
     * 保存设置
     */
    onSave() {
      const {
        targetResource,
        currentResource,
        reminderThreshold,
        periodicReminder,
        reminderData
      } = this.data;

      let result;
      if (reminderData?.id) {
        // 更新已有提醒
        result = reminderService.updateHoardingReminder(reminderData.id, {
          targetResource,
          currentResource,
          reminderThreshold,
          periodicReminder
        });
      } else {
        // 创建新提醒
        result = reminderService.createHoardingReminder({
          gameId: this.data.gameId,
          gameName: this.data.gameName,
          targetResource,
          currentResource,
          reminderThreshold,
          periodicReminder
        });
      }

      if (result.success) {
        wx.showToast({ title: '已保存', icon: 'success' });
        this.triggerEvent('save', result.data);
      } else {
        wx.showToast({ title: result.error || '保存失败', icon: 'none' });
      }
    }
  }
});