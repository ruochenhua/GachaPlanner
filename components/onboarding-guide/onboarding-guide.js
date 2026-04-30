// components/onboarding-guide/onboarding-guide.js
// 新手引导组件

Component({
  /**
   * 组件属性
   */
  properties: {
    // 是否显示引导
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    currentPage: 0,
    totalPages: 3,
    // 指示器颜色
    indicatorColor: '#EBE8E4',
    indicatorActiveColor: '#C4A77D',
    // 引导页面内容
    pages: [
      {
        id: 1,
        icon: '🎮',
        title: '欢迎使用GachaPlaner',
        description: '你的多游戏抽卡规划助手',
        backgroundColor: '#D4BC99'
      },
      {
        id: 2,
        icon: '📊',
        title: '多游戏统一管理',
        description: '原神、星铁、明日方舟...',
        highlight: '一个工具管理所有游戏的抽卡规划',
        backgroundColor: '#D4BC99'
      },
      {
        id: 3,
        icon: '💡',
        title: '智能建议决策',
        description: '不只是概率计算',
        highlight: '直接告诉你"该不该抽"',
        backgroundColor: '#D4BC99'
      }
    ]
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this._startTime = Date.now();
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 页面切换事件
     */
    onPageChange(e) {
      this.setData({
        currentPage: e.detail.current
      });
    },

    /**
     * 跳过引导
     */
    onSkip() {
      this.completeGuide();
    },

    /**
     * 完成引导
     */
    onComplete() {
      this.completeGuide();
    },

    /**
     * 完成引导并触发事件
     */
    completeGuide() {
      // 记录引导时间
      const duration = Date.now() - this._startTime;
      if (duration > 30000) {
        console.warn('引导时间超过30秒:', duration);
      }

      // 标记引导已完成
      try {
        wx.setStorageSync('onboarding_completed', true);
      } catch (e) {
        console.error('保存引导状态失败:', e);
      }

      // 触发完成事件
      this.triggerEvent('complete');
    },

    /**
     * 获取当前页面描述（可访问性）
     */
    getPageDescription(pageIndex) {
      const page = this.data.pages[pageIndex];
      return `第${pageIndex + 1}页，共${this.data.totalPages}页：${page.title}`;
    }
  }
});