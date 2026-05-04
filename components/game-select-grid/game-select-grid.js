Component({
  properties: {
    games: { type: Array, value: [] },
    iconFailed: { type: Object, value: {} },
    themeClass: { type: String, value: '' }
  },

  data: {
    fallbackColors: ['--color-primary', '--color-success', '--color-info']
  },

  methods: {
    onGameTap(e) {
      const { gameId } = e.currentTarget.dataset;
      this.triggerEvent('tapgame', { gameId });
    },

    onIconError(e) {
      const { gameId } = e.currentTarget.dataset;
      this.triggerEvent('iconerror', { gameId });
    },

    getFallbackStyle(gameId) {
      const hash = gameId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const colorIdx = hash % 3;
      const colors = [
        ['#C4A77D', '#D4B896'],
        ['#7FB069', '#8BC476'],
        ['#6B8BA4', '#8BAAC0']
      ];
      const [c1, c2] = colors[colorIdx];
      return `background: linear-gradient(135deg, ${c1}, ${c2})`;
    },

    getFirstLetter(gameId) {
      return gameId.charAt(0).toUpperCase();
    }
  }
});
