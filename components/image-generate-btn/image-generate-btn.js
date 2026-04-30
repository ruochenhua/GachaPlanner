// components/image-generate-btn/image-generate-btn.js
// 图片生成按钮组件

const imageGenerator = require('../../services/image-generator');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 规划数据
    planningData: {
      type: Object,
      value: {}
    },
    // 图片类型 'wechat' | 'moments' | 'momentsWide'
    imageType: {
      type: String,
      value: 'wechat'
    }
  },

  /**
   * 组件数据
   */
  data: {
    generating: false,
    showPreview: false,
    imagePath: ''
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 生成图片
     */
    async onGenerate() {
      if (this.data.generating) return;

      const planningData = this.data.planningData;
      if (!planningData || !planningData.gameName) {
        wx.showToast({
          title: '请先完成规划计算',
          icon: 'none'
        });
        return;
      }

      this.setData({ generating: true });

      try {
        const result = await imageGenerator.generatePlanningImage(
          planningData,
          this.data.imageType
        );

        if (result.success) {
          this.setData({
            imagePath: result.data.tempFilePath,
            showPreview: true
          });

          this.triggerEvent('generate', {
            imagePath: result.data.tempFilePath,
            width: result.data.width,
            height: result.data.height
          });
        } else {
          wx.showToast({
            title: result.error || '生成失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('生成图片失败:', err);
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        });
      } finally {
        this.setData({ generating: false });
      }
    },

    /**
     * 保存到相册
     */
    async onSaveToAlbum() {
      const { imagePath } = this.data;
      if (!imagePath) return;

      wx.showLoading({ title: '保存中...' });

      try {
        const result = await imageGenerator.saveToAlbum(imagePath);

        if (result.success) {
          wx.showToast({
            title: '已保存到相册',
            icon: 'success'
          });
          this.triggerEvent('save', { imagePath });
        } else {
          wx.showToast({
            title: result.error || '保存失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('保存图片失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
      }
    },

    /**
     * 分享图片
     */
    onShare() {
      const { imagePath } = this.data;
      if (!imagePath) return;

      this.triggerEvent('share', { imagePath });
    },

    /**
     * 关闭预览
     */
    onClosePreview() {
      this.setData({ showPreview: false });
    },

    /**
     * 重新生成
     */
    onRegenerate() {
      this.setData({ showPreview: false });
      this.onGenerate();
    }
  }
});