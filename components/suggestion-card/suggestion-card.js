// components/suggestion-card/suggestion-card.js
// 智能建议卡片组件 - 展示建议生成引擎的输出

Component({
  /**
   * 组件属性
   */
  properties: {
    suggestion: {
      type: Object,
      value: {
        type: 'priority',      // priority/risk/strategy
        level: 'info',         // info/warning/danger
        content: '',           // 建议文字
        priority: 1,           // 优先级（1-5）
        confidence: 0.8,       // 置信度（0-1）
        icon: '💡',            // 图标
        data: {}               // 支撑数据
      },
      observer: 'onSuggestionChange'
    },
    expanded: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    displayIcon: '💡',
    levelClass: '',
    bgColor: '',
    textColor: '',
    borderColor: '',
    confidencePercent: 0,
    iconMap: {
      priority: '🎯',
      risk: '⚠️',
      strategy: '💡'
    },
    levelColors: {
      info: {
        bg: '#E8F5E9',      // Success Green浅色背景
        text: '#7FB069',    // Success Green
        border: '#9FC089'
      },
      warning: {
        bg: '#FFF8E1',      // Warning Yellow浅色背景
        text: '#E4C786',    // Warning Yellow
        border: '#F4D796'
      },
      danger: {
        bg: '#FFEBEE',      // Error Red浅色背景
        text: '#C47070',    // Error Red
        border: '#D48080'
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 建议变化观察器
     * @param {Object} newVal - 新的建议对象
     */
    onSuggestionChange(newVal) {
      if (!newVal || !newVal.type) return;

      const { iconMap, levelColors } = this.data;
      const { type, level, icon, confidence } = newVal;

      // 设置图标
      const displayIcon = icon || iconMap[type] || '💡';

      // 设置颜色
      const colors = levelColors[level] || levelColors.info;

      // 设置置信度百分比（确保在0-1范围内）
      const confidencePercent = Math.round(Math.max(0, Math.min(1, confidence || 0)) * 100);

      this.setData({
        displayIcon,
        levelClass: `level-${colors === levelColors.info && level !== 'info' ? 'info' : level}`,
        bgColor: colors.bg,
        textColor: colors.text,
        borderColor: colors.border,
        confidencePercent
      });
    },

    /**
     * 点击卡片切换展开状态
     */
    onTap() {
      this.setData({
        expanded: !this.data.expanded
      });
    }
  }
});
