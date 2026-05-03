Component({
  properties: {
    gameId: { type: String, value: '' },
    gameName: { type: String, value: '' },
    currentPulls: { type: Number, value: 0 },
    totalPulls: { type: Number, value: 0 },
    probability: { type: Number, value: 0 },
    probabilityText: { type: String, value: '' },
    stepSizes: { type: Array, value: [1, 10] },
    minPulls: { type: Number, value: 0 },
    isEditing: { type: Boolean, value: true },
    highlight: { type: Boolean, value: false }
  },
  data: {
    percentage: 0
  },
  observers: {
    'currentPulls, totalPulls': function() {
      this.calcPercentage();
    }
  },
  lifetimes: {
    attached() {
      this.calcPercentage();
    }
  },
  methods: {
    calcPercentage() {
      const { currentPulls, totalPulls } = this.properties;
      const percentage = totalPulls > 0 ? Math.round((currentPulls / totalPulls) * 100) : 0;
      this.setData({ percentage });
    },
    onDecrement(e) {
      const { step } = e.currentTarget.dataset;
      const { gameId, currentPulls, minPulls } = this.properties;
      const newPulls = Math.max(minPulls, currentPulls - step);
      const delta = newPulls - currentPulls;
      if (delta !== 0) {
        this.triggerEvent('decrement', { gameId, step });
        this.triggerEvent('change', { gameId, newPulls, delta, source: 'step' });
      }
    },
    onIncrement(e) {
      const { step } = e.currentTarget.dataset;
      const { gameId, currentPulls } = this.properties;
      const newPulls = currentPulls + step;
      const delta = newPulls - currentPulls;
      this.triggerEvent('increment', { gameId, step });
      this.triggerEvent('change', { gameId, newPulls, delta, source: 'step' });
    },
    onInputTap() {
      const { gameId, currentPulls } = this.properties;
      this.triggerEvent('inputtap', { gameId, currentPulls });
    }
  }
});