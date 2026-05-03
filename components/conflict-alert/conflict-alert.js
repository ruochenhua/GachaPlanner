Component({
  properties: {
    conflicts: { type: Array, value: [] },
    threshold: { type: Number, value: 0.8 },
    dismissed: { type: Boolean, value: false }
  },
  data: {
    visible: false,
    description: '',
    solution: ''
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

        // 生成具体解决方案
        let solution = '';
        if (conflicts.length > 0) {
          const sorted = [...conflicts].sort((a, b) => (a.probability || 0) - (b.probability || 0));
          const lowest = sorted[0];
          const highest = sorted[sorted.length - 1];
          if (lowest && highest) {
            const needed = Math.ceil((0.8 - (lowest.probability || 0)) * 100);
            if (needed > 0) {
              solution = `建议补充 ${needed} 抽提升「${lowest.gameName || lowest.targetName}」达成率，或放弃该目标集中资源至「${highest.gameName || highest.targetName}」`;
            } else {
              solution = `建议放弃「${lowest.gameName || lowest.targetName}」目标，将资源集中至「${highest.gameName || highest.targetName}」`;
            }
          }
        }

        this.setData({ description, solution });
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