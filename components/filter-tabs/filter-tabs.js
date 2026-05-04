Component({
  properties: {
    categories: { type: Array, value: [] },
    activeId: { type: String, value: 'all' },
    themeClass: { type: String, value: '' }
  },

  methods: {
    onTap(e) {
      const { id } = e.currentTarget.dataset;
      if (id !== this.data.activeId) {
        this.triggerEvent('change', { id });
      }
    }
  }
});
