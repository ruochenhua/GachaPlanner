/**
 * Theme Service - 主题控制器
 * 管理用户主题偏好、系统主题监听、页面样式注入
 * 
 * 决策优先级：手动设置 > 系统主题
 * 三档切换：'light' | 'dark' | 'system'
 */

const STORAGE_KEY = 'theme_preference';

class ThemeService {
  constructor() {
    this.userPreference = 'system';
    this.systemTheme = 'light';
    this.listeners = [];
    this._inited = false;
  }

  /**
   * 初始化主题服务
   * 在 app.js onLaunch 中调用一次
   */
  init() {
    if (this._inited) return;
    this._inited = true;

    // 1. 读取用户偏好
    try {
      const stored = wx.getStorageSync(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        this.userPreference = stored;
      }
    } catch (e) {
      // 忽略存储读取错误，使用默认值 'system'
    }

    // 2. 读取系统主题（基础库 >= 2.11.0 支持）
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.systemTheme = sysInfo.theme || 'light';
    } catch (e) {
      this.systemTheme = 'light';
    }

    // 3. 监听系统主题变化
    if (wx.onThemeChange) {
      wx.onThemeChange((res) => {
        this.systemTheme = res.theme || 'light';
        if (this.userPreference === 'system') {
          this.apply();
        }
      });
    }

    // 4. 初始应用
    this.apply();
  }

  /**
   * 获取实际生效的主题
   * @returns {'light' | 'dark'}
   */
  resolve() {
    if (this.userPreference === 'light') return 'light';
    if (this.userPreference === 'dark') return 'dark';
    return this.systemTheme || 'light';
  }

  /**
   * 获取当前用户偏好
   * @returns {'light' | 'dark' | 'system'}
   */
  getPreference() {
    return this.userPreference;
  }

  /**
   * 设置用户主题偏好
   * @param {'light' | 'dark' | 'system'} pref
   */
  setPreference(pref) {
    if (!['light', 'dark', 'system'].includes(pref)) return;

    this.userPreference = pref;

    // 持久化
    try {
      wx.setStorageSync(STORAGE_KEY, pref);
    } catch (e) {
      // 忽略存储写入错误
    }

    this.apply();
  }

  /**
   * 应用主题到当前页面
   * 同步 page class + 广播事件
   */
  apply() {
    const theme = this.resolve();
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    if (!currentPage) return;

    // 移除旧 class
    const oldClasses = ['dark-mode', 'force-light', 'force-dark'];
    // 注意：微信小程序没有直接操作 page 节点 class 的 API
    // 我们通过 setData 在页面的根节点上加 class
    // 但更好的方式是在 page 根 view 上通过 data 控制

    // 方案：触发事件，让页面自己处理 class 切换
    // 但 pages 是各页面独立的，这里我们用最直接的方式：
    // 通过页面实例的 setData 设置一个 themeClass

    if (currentPage.setData) {
      let themeClass = '';
      if (this.userPreference === 'dark') {
        themeClass = 'dark-mode force-dark';
      } else if (this.userPreference === 'light') {
        themeClass = 'force-light';
      } else {
        // system
        themeClass = theme === 'dark' ? 'dark-mode' : '';
      }
      currentPage.setData({ themeClass });
    }

    // 同步 tabBar 样式（硬编码颜色，因为 tabBar 不支持 CSS 变量）
    if (wx.setTabBarStyle) {
      const isDark = theme === 'dark';
      wx.setTabBarStyle({
        color: isDark ? '#A8A29E' : '#7A7168',
        selectedColor: isDark ? '#D4BC99' : '#C4A77D',
        backgroundColor: isDark ? '#1C1917' : '#FAF9F7',
        borderStyle: isDark ? 'black' : 'white'
      });
    }

    // 广播给监听者（Canvas 组件等）
    this._notify(theme);
  }

  /**
   * 注册主题变化监听
   * @param {Function} callback 接收 'light' | 'dark'
   */
  onChange(callback) {
    if (typeof callback === 'function' && !this.listeners.includes(callback)) {
      this.listeners.push(callback);
    }
  }

  /**
   * 移除主题变化监听
   * @param {Function} callback
   */
  offChange(callback) {
    const idx = this.listeners.indexOf(callback);
    if (idx > -1) {
      this.listeners.splice(idx, 1);
    }
  }

  /**
   * 通知所有监听者
   * @private
   */
  _notify(theme) {
    this.listeners.forEach((cb) => {
      try {
        cb(theme);
      } catch (e) {
        // 忽略单个监听器的错误
      }
    });
  }
}

// 单例导出
const themeService = new ThemeService();
module.exports = themeService;
