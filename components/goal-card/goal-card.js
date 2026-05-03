Component({
  properties: {
    gameId: { type: String, value: '' },
    gameName: { type: String, value: '' },
    gameIcon: { type: String, value: '' },
    target: { type: Object, value: null },
    currentPulls: { type: Number, value: 0 },
    probability: { type: Number, value: 0 },
    probabilityText: { type: String, value: '' },
    neededPulls: { type: Number, value: 0 },
    poolStartDate: { type: String, value: '' },
    status: { type: String, value: 'auto' }
  },
  data: {
    statusColor: '',
    statusBg: '',
    daysUntilPool: 0
  },
  lifetimes: {
    attached() {

      this.updateStatus();
      this.calcDaysUntilPool();
    }
  },
  observers: {
    'probability, status': function() {
      this.updateStatus();
    },
    'poolStartDate': function() {
      this.calcDaysUntilPool();
    }
  },
  methods: {
    updateStatus() {
      const { probability, status } = this.properties;
      let effectiveStatus = status;
      if (status === 'auto') {
        if (probability >= 0.8) effectiveStatus = 'safe';
        else if (probability >= 0.5) effectiveStatus = 'warning';
        else effectiveStatus = 'danger';
      }

      const colorMap = {
        safe: { color: '#7CB342', bg: '#E8F5E9' },
        warning: { color: '#F5A623', bg: '#FFF3E0' },
        danger: { color: '#C47070', bg: '#FFEBEE' }
      };

      const style = colorMap[effectiveStatus] || colorMap.danger;
      this.setData({
        statusColor: style.color,
        statusBg: style.bg
      });
    },
    calcDaysUntilPool() {
      const { poolStartDate } = this.properties;
      if (!poolStartDate) {
        this.setData({ daysUntilPool: 0 });
        return;
      }
      const start = new Date(poolStartDate);
      const now = new Date();
      const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      this.setData({ daysUntilPool: diff > 0 ? diff : 0 });
    },
    onTapTitle() {
      this.triggerEvent('taptitle', { gameId: this.properties.gameId });
    },
    onTapMenu(e) {
      e.stopPropagation();
      const { gameId } = this.properties;
      wx.showActionSheet({
        itemList: ['编辑目标', '删除目标'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.triggerEvent('edit', { gameId });
          } else if (res.tapIndex === 1) {
            wx.showModal({
              title: '确认删除',
              content: '确定要删除这个目标吗？',
              confirmColor: '#C47070',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.triggerEvent('delete', { gameId });
                }
              }
            });
          }
        }
      });
    }
  }
});