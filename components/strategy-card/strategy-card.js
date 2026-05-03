Component({
  properties: {
    strategy: { type: Object, value: null },
    currentAllocations: { type: Array, value: [] },
    isRecommended: { type: Boolean, value: false },
    index: { type: Number, value: 0 }
  },
  data: {
    comparison: []
  },
  observers: {
    'strategy, currentAllocations': function() {
      this.calcComparison();
    }
  },
  lifetimes: {
    attached() {
      this.calcComparison();
    }
  },
  methods: {
    calcComparison() {
      const { strategy, currentAllocations } = this.properties;
      if (!strategy || !strategy.allocations || !currentAllocations) {
        this.setData({ comparison: [] });
        return;
      }
      const comparison = strategy.allocations.map(alloc => {
        const current = currentAllocations.find(a => a.gameId === alloc.gameId);
        const pullDelta = current ? alloc.pulls - current.currentPulls : 0;
        const probDelta = current ? alloc.probability - current.probability : 0;
        return {
          gameId: alloc.gameId,
          gameName: alloc.gameName,
          currentPulls: current ? current.currentPulls : 0,
          currentProbabilityText: current ? current.probabilityText : '?%',
          suggestedPulls: alloc.pulls,
          suggestedProbabilityText: alloc.probabilityText,
          pullDelta,
          probDelta
        };
      });
      this.setData({ comparison });
    },
    onApply() {
      const { strategy } = this.properties;
      if (!strategy) return;
      this.triggerEvent('apply', { strategyId: strategy.id });
    }
  }
});
