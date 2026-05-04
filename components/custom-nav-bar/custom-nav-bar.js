/**
 * Custom Navigation Bar 组件
 * 支持自定义标题、返回按钮、主题适配
 */

const themeService = require('../../services/theme-service');

Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    },
    bgColor: {
      type: String,
      value: ''
    }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    capsuleHeight: 32,
    capsuleRight: 7,
    _showBack: false,
    themeClass: ''
  },

  lifetimes: {
    attached() {
      this._calcNavBarLayout();

      // 自动判断是否需要返回按钮
      const pages = getCurrentPages();
      if (pages.length > 1 && !this.properties.showBack) {
        this.setData({ _showBack: true });
      }

      // 主题适配：自己监听主题变化，避免继承链断裂
      this.theme = themeService.resolve();
      this.setData({ themeClass: this._resolveThemeClass() });
      this._onThemeChange = (theme) => {
        this.theme = theme;
        this.setData({ themeClass: this._resolveThemeClass() });
      };
      themeService.onChange(this._onThemeChange);
    },

    detached() {
      themeService.offChange(this._onThemeChange);
    }
  },

  methods: {
    _resolveThemeClass() {
      const pref = themeService.getPreference();
      if (pref === 'dark') return 'dark-mode force-dark';
      if (pref === 'light') return 'force-light';
      return this.theme === 'dark' ? 'dark-mode' : '';
    },

    _calcNavBarLayout() {
      try {
        const sysInfo = wx.getSystemInfoSync();
        const menuBtnRect = wx.getMenuButtonBoundingClientRect();

        const statusBarHeight = sysInfo.statusBarHeight || 20;
        const navBarHeight = statusBarHeight + 44;
        const capsuleHeight = menuBtnRect.height || 32;
        const capsuleRight = sysInfo.windowWidth - menuBtnRect.right || 7;

        this.setData({
          statusBarHeight,
          navBarHeight,
          capsuleHeight,
          capsuleRight
        });
      } catch (e) {
        console.warn('CustomNavBar: failed to calc layout', e);
      }
    },

    onBack() {
      wx.navigateBack({
        fail: () => {
          wx.switchTab({ url: '/pages/overview/overview' });
        }
      });
    }
  }
});
