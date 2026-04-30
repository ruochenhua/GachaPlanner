/**
 * 数据过期警告组件
 * 当游戏数据超过30天未更新时显示警告提示
 */

const dataExpiryChecker = require('../../utils/data-expiry-checker');

Component({
  properties: {
    // 游戏ID
    gameId: {
      type: String,
      value: ''
    },
    // 更新日期
    updatedAt: {
      type: String,
      value: ''
    },
    // 过期阈值天数
    thresholdDays: {
      type: Number,
      value: 30
    },
    // 是否可关闭
    dismissible: {
      type: Boolean,
      value: true
    }
  },

  data: {
    showWarning: false,
    warningLevel: null,
    message: '',
    dismissed: false
  },

  lifetimes: {
    attached() {
      this.checkExpiry();
      this.loadDismissedState();
    }
  },

  observers: {
    'updatedAt, thresholdDays': function() {
      this.checkExpiry();
    }
  },

  methods: {
    /**
     * 检测过期状态
     */
    checkExpiry() {
      if (!this.data.updatedAt) {
        this.setData({ showWarning: false });
        return;
      }

      const expiryResult = dataExpiryChecker.checkDataExpiry(
        this.data.updatedAt,
        this.data.thresholdDays
      );

      const warningLevel = dataExpiryChecker.getExpiryWarningLevel(expiryResult);
      const message = dataExpiryChecker.formatExpiryMessage(expiryResult);

      this.setData({
        showWarning: expiryResult.isExpired || warningLevel.level === 'warning',
        warningLevel,
        message,
        expiryResult
      });
    },

    /**
     * 加载已关闭状态
     */
    loadDismissedState() {
      try {
        const dismissedKey = `expiry_warning_dismissed_${this.data.gameId}`;
        const dismissedUntil = wx.getStorageSync(dismissedKey);

        if (dismissedUntil) {
          const now = Date.now();
          if (now < dismissedUntil) {
            this.setData({ dismissed: true });
          } else {
            // 已过关闭期限，清除状态
            wx.removeStorageSync(dismissedKey);
          }
        }
      } catch (err) {
        console.error('加载关闭状态失败:', err);
      }
    },

    /**
     * 关闭警告
     */
    onDismiss() {
      if (!this.data.dismissible) return;

      // 保存关闭状态（当天不再显示）
      try {
        const dismissedKey = `expiry_warning_dismissed_${this.data.gameId}`;
        const dismissedUntil = new Date();
        dismissedUntil.setDate(dismissedUntil.getDate() + 1);
        dismissedUntil.setHours(0, 0, 0, 0);

        wx.setStorageSync(dismissedKey, dismissedUntil.getTime());

        this.setData({ dismissed: true });

        this.triggerEvent('dismiss', { gameId: this.data.gameId });
      } catch (err) {
        console.error('保存关闭状态失败:', err);
      }
    },

    /**
     * 点击查看官方公告
     */
    onCheckAnnouncement() {
      this.triggerEvent('checkannouncement', { gameId: this.data.gameId });
    }
  }
});