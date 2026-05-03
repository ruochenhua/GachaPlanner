Component({
  properties: {
    strategy: { type: Object, value: null },
    isPreviewing: { type: Boolean, value: false },
    isRecommended: { type: Boolean, value: false },
    index: { type: Number, value: 0 }
  },
  methods: {
    onPreview() {
      const { strategy } = this.properties;
      if (!strategy) return;
      this.triggerEvent('preview', { strategyId: strategy.id });
    },
    onApply() {
      const { strategy } = this.properties;
      if (!strategy) return;
      this.triggerEvent('apply', { strategyId: strategy.id });
    },
    onCancel() {
      const { strategy } = this.properties;
      if (!strategy) return;
      this.triggerEvent('cancel', { strategyId: strategy.id });
    }
  }
});