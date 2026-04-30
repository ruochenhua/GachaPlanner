// components/resource-input/resource-input.js
// 资源输入组件 - 简化版本

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    resourceKey: {
      type: String,
      value: ''
    },
    resourceName: {
      type: String,
      value: ''
    },
    resourceIcon: {
      type: String,
      value: ''
    },
    value: {
      type: Number,
      value: 0
    },
    min: {
      type: Number,
      value: 0
    },
    max: {
      type: Number,
      value: 100000
    },
    step: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 不再需要 sliderValue 和 inputValue，直接使用 value
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 图片加载失败处理
     */
    onImageError(e) {
      console.log('资源图标加载失败:', this.data.resourceIcon);
    },

    /**
     * 输入框变化事件
     */
    onInputChange(e) {
      const value = parseInt(e.detail.value) || 0;
      this.triggerChange(value);
    },

    /**
     * 输入框确认事件（按回车）
     */
    onInputConfirm(e) {
      const value = parseInt(e.detail.value) || 0;
      const clampedValue = Math.max(this.data.min, Math.min(value, this.data.max));
      this.triggerChange(clampedValue);
    },

    /**
     * 快捷加减按钮点击
     */
    onQuickAdd(e) {
      const delta = parseInt(e.currentTarget.dataset.value) || 0;
      const newValue = Math.max(this.data.min, Math.min(this.data.value + delta, this.data.max));
      this.triggerChange(newValue);
    },

    /**
     * 重置按钮点击
     */
    onReset() {
      this.triggerChange(0);
    },

    /**
     * 触发change事件（防抖）
     */
    triggerChange(value) {
      // 清除之前的定时器
      if (this._changeTimer) {
        clearTimeout(this._changeTimer);
      }

      // 保存组件实例引用
      const self = this;

      // 设置新的防抖定时器（缩短防抖时间，提升响应速度）
      this._changeTimer = setTimeout(() => {
        console.log('资源输入变化:', self.data.resourceKey, value);
        self.triggerEvent('change', {
          key: self.data.resourceKey,
          value: value
        });
        self._changeTimer = null;
      }, 100);  // 缩短到100ms，更快响应
    }
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      console.log('资源输入组件attached:', this.data.resourceName);
    },
    detached() {
      // 清理定时器
      if (this._changeTimer) {
        clearTimeout(this._changeTimer);
        this._changeTimer = null;
      }
    }
  }
});