Component({
  properties: {
    conflicts: { type: Array, value: [] },
    threshold: { type: Number, value: 0.8 },
    dismissed: { type: Boolean, value: false }
  },
  data: {
    visible: false,
    description: ''
  },
  observers: {
    'conflicts, dismissed': function() {
      this.updateVisibility();
    }
  },
  lifetimes: {
    attached() {
      this.updateVisibility();
    }
  },
  methods: {
    updateVisibility() {
      const { conflicts, dismissed } = this.properties;
      const visible = (conflicts || []).length >= 2 && !dismissed;
      this.setData({ visible });

      if (visible) {
        const names = conflicts.map(c => c.targetName).filter(Boolean);
        let description = '';
        if (names.length >= 2) {
          const last = names.pop();
          description = `你想抽${names.join('、')}和${last}，但资源不够稳`;
        } else {
          description = '多个游戏目标达成概率不足，资源存在冲突';
        }
        this.setData({ description });
      }
    },
    onTapHelp() {
      const { conflicts, threshold } = this.properties;
      this.triggerEvent('taphelp', { conflicts, threshold });
    },
    onTapDismiss() {
      const { conflicts } = this.properties;
      this.triggerEvent('tapdismiss', { conflicts });
    }
  }
});