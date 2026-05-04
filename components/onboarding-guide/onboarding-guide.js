// components/onboarding-guide/onboarding-guide.js
// 新手引导组件

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentPage: 0,
    totalPages: 3,
    pages: [
      {
        id: 1,
        icon: '🎮',
        title: '欢迎使用GachaPlaner',
        description: '你的多游戏抽卡规划助手',
      },
      {
        id: 2,
        icon: '📊',
        title: '多游戏统一管理',
        description: '原神、星铁、明日方舟...',
        highlight: '一个工具管理所有游戏的抽卡规划',
      },
      {
        id: 3,
        icon: '💡',
        title: '智能建议决策',
        description: '不只是概率计算',
        highlight: '直接告诉你"该不该抽"',
      }
    ]
  },

  lifetimes: {
    attached() {
      this._startTime = Date.now();
    }
  },

  methods: {
    onPageChange(e) {
      this.setData({
        currentPage: e.detail.current
      });
    },

    onSkip() {
      this.completeGuide();
    },

    onComplete() {
      this.completeGuide();
    },

    completeGuide() {
      const duration = Date.now() - this._startTime;
      if (duration > 30000) {
        console.warn('引导时间超过30秒:', duration);
      }

      try {
        wx.setStorageSync('onboarding_completed', true);
      } catch (e) {
        console.error('保存引导状态失败:', e);
      }

      this.triggerEvent('complete');
    },

    getPageDescription(pageIndex) {
      const page = this.data.pages[pageIndex];
      return `第${pageIndex + 1}页，共${this.data.totalPages}页：${page.title}`;
    }
  }
});
