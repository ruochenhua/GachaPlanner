// components/share-guide/share-guide.js
// 分享引导组件

Component({
  /**
   * 组件属性
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {},

  /**
   * 组件方法
   */
  methods: {
    /**
     * 关闭引导
     */
    onClose() {
      // 记录已看过引导
      this.recordGuideViewed();
      this.triggerEvent('close');
    },

    /**
     * 记录已看过引导
     */
    recordGuideViewed() {
      try {
        wx.setStorageSync('share_guide_viewed', true);
      } catch (err) {
        console.error('记录引导状态失败:', err);
      }
    }
  }
});