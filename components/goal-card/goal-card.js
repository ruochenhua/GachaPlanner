Component({
  properties: {
    gameId: { type: String, value: '' },
    gameName: { type: String, value: '' },
    gameIcon: { type: String, value: '' },
    targets: { type: Array, value: [] },
    currentPulls: { type: Number, value: 0 },
    probability: { type: Number, value: 0 },
    probabilityText: { type: String, value: '' },
    neededPulls: { type: Number, value: 0 }
  },
  data: {
    targetSummary: '',
    statusBg: '#FFFFFF',
    statusColor: '#C4A77D',
    daysUntilPool: 0
  },
  observers: {
    'targets, probability, neededPulls': function() {
      this.updateDisplay();
    }
  },
  lifetimes: {
    attached() {
      this.updateDisplay();
    }
  },
  methods: {
    updateDisplay() {
      const { targets, probability, neededPulls } = this.properties;

      // 构建目标摘要
      let targetSummary = '';
      if (targets && targets.length > 0) {
        const parts = targets.map(t => {
          const name = t.name || '未命名';
          const rank = t.desiredRank !== undefined ? t.desiredRank : (t.constellations || 0);
          const unit = t.type === 'weapon' ? '精' : '命';
          return `${name} ${rank}${unit}`;
        });
        targetSummary = parts.join(' + ');
      } else {
        targetSummary = '未设定目标';
      }

      // 状态颜色
      let statusColor = '#C4A77D';
      let statusBg = '#FFFFFF';
      if (probability >= 0.8) {
        statusColor = '#7FB069';
        statusBg = '#F0F7EC';
      } else if (probability >= 0.5) {
        statusColor = '#F5A623';
        statusBg = '#FEF8E8';
      } else if (probability > 0) {
        statusColor = '#C47070';
        statusBg = '#FDE8E8';
      }

      // 计算距离卡池开始的天数
      let daysUntilPool = 0;
      if (targets && targets.length > 0) {
        const firstTarget = targets[0];
        if (firstTarget.poolStartDate) {
          const start = new Date(firstTarget.poolStartDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          daysUntilPool = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
        }
      }

      this.setData({ targetSummary, statusColor, statusBg, daysUntilPool });
    },
    onTapTitle() {
      this.triggerEvent('taptitle', { gameId: this.properties.gameId });
    },
    onTapMenu() {
      this.triggerEvent('tapmenu', { gameId: this.properties.gameId });
    }
  }
});
