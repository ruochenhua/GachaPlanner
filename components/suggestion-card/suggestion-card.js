// components/suggestion-card/suggestion-card.js
// 智能建议卡片组件 - 展示建议生成引擎的输出

Component({
  properties: {
    suggestion: {
      type: Object,
      value: {
        type: 'priority',
        level: 'info',
        content: '',
        priority: 1,
        confidence: 0.8,
        icon: '💡',
        data: {}
      },
      observer: 'onSuggestionChange'
    },
    expanded: {
      type: Boolean,
      value: false
    }
  },

  data: {
    displayIcon: '💡',
    levelClass: '',
    confidencePercent: 0,
    iconMap: {
      priority: '🎯',
      risk: '⚠️',
      strategy: '💡'
    }
  },

  methods: {
    onSuggestionChange(newVal) {
      if (!newVal || !newVal.type) return;

      const { iconMap } = this.data;
      const { type, level, icon, confidence } = newVal;

      const displayIcon = icon || iconMap[type] || '💡';
      const confidencePercent = Math.round(Math.max(0, Math.min(1, confidence || 0)) * 100);

      const validLevel = ['info', 'warning', 'danger'].includes(level) ? level : 'info';
      this.setData({
        displayIcon,
        levelClass: `level-${validLevel}`,
        confidencePercent
      });
    },

    onTap() {
      this.setData({
        expanded: !this.data.expanded
      });
    }
  }
});
