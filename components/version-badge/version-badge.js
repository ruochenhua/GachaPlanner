/**
 * 版本信息徽章组件
 * 显示游戏数据版本号和更新日期
 */

Component({
  properties: {
    // 游戏ID
    gameId: {
      type: String,
      value: ''
    },
    // 版本号
    version: {
      type: String,
      value: ''
    },
    // 更新日期
    updatedAt: {
      type: String,
      value: ''
    },
    // 游戏名称
    gameName: {
      type: String,
      value: ''
    },
    // 显示模式：simple/detail
    mode: {
      type: String,
      value: 'simple'
    }
  },

  data: {
    formattedDate: '',
    isExpired: false
  },

  lifetimes: {
    attached() {
      this.formatData();
    }
  },

  observers: {
    'updatedAt': function() {
      this.formatData();
    }
  },

  methods: {
    /**
     * 格式化数据
     */
    formatData() {
      if (this.data.updatedAt) {
        // 格式化日期显示
        const dateStr = this.data.updatedAt;
        this.setData({
          formattedDate: dateStr
        });

        // 检测过期状态
        this.checkExpiry();
      }
    },

    /**
     * 检测过期状态
     */
    checkExpiry() {
      const { checkDataExpiry } = require('../../utils/data-expiry-checker');
      const result = checkDataExpiry(this.data.updatedAt);
      this.setData({ isExpired: result.isExpired });
    },

    /**
     * 点击查看详情
     */
    onTap() {
      this.triggerEvent('tap', {
        gameId: this.data.gameId,
        version: this.data.version,
        updatedAt: this.data.updatedAt
      });
    }
  }
});