// components/share-btn/share-btn.js
// 分享按钮组件

const shareService = require('../../services/share-service');

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
    // 是否显示自定义按钮
    showCustomize: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    showCustomize: false,
    customTitle: '',
    customDesc: '',
    selectedStyle: 'default'
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 初始化分享配置
      if (this.data.planningData.gameName) {
        shareService.buildShareConfig(this.data.planningData);
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 微信好友分享
     */
    onShareFriend() {
      const planningData = this.data.planningData;

      if (!planningData.gameName) {
        wx.showToast({
          title: '请先完成规划',
          icon: 'none'
        });
        return;
      }

      const result = shareService.shareToFriend(planningData);

      if (result.success) {
        this.triggerEvent('share', {
          type: 'friend',
          config: result.data
        });
      }
    },

    /**
     * 朋友圈分享
     */
    async onShareMoments() {
      const planningData = this.data.planningData;

      if (!planningData.gameName) {
        wx.showToast({
          title: '请先完成规划',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '生成图片中...' });

      try {
        const result = await shareService.shareToMoments(planningData, 'moments');

        if (result.success) {
          this.triggerEvent('share', {
            type: 'moments',
            imagePath: result.data.imagePath
          });
        } else {
          wx.showToast({
            title: result.error || '分享失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('朋友圈分享失败:', err);
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
      }
    },

    /**
     * 打开自定义弹窗
     */
    onOpenCustomize() {
      const config = shareService.shareConfig || {};
      this.setData({
        showCustomize: true,
        customTitle: config.title || '',
        customDesc: config.desc || '',
        selectedStyle: 'default'
      });
    },

    /**
     * 关闭自定义弹窗
     */
    onCloseCustomize() {
      this.setData({ showCustomize: false });
    },

    /**
     * 标题输入
     */
    onTitleInput(e) {
      this.setData({ customTitle: e.detail.value });
    },

    /**
     * 描述输入
     */
    onDescInput(e) {
      this.setData({ customDesc: e.detail.value });
    },

    /**
     * 选择样式
     */
    onSelectStyle(e) {
      this.setData({ selectedStyle: e.currentTarget.dataset.style });
    },

    /**
     * 保存自定义配置
     */
    onSaveCustomize() {
      const { customTitle, customDesc, selectedStyle } = this.data;

      const result = shareService.customizeShare({
        title: customTitle,
        desc: customDesc,
        style: selectedStyle
      });

      if (result.success) {
        wx.showToast({
          title: '已保存',
          icon: 'success'
        });
        this.setData({ showCustomize: false });

        this.triggerEvent('customize', result.data);
      }
    }
  }
});