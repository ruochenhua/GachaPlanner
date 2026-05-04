Component({
  properties: {
    letters: { type: Array, value: [] },
    themeClass: { type: String, value: '' }
  },

  methods: {
    onTap(e) {
      const { letter } = e.currentTarget.dataset;
      this.triggerEvent('tap', { letter });
    }
  }
});
