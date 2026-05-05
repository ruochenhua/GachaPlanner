const { createGameConfig } = require('./_template');

module.exports = createGameConfig('fgo', {
  gameId: 'fgo',
  name: '命运-冠位指定',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  resources: {
    primary: {
      id: 'quartz',
      name: '圣晶石',
      icon: '/assets/images/games/quartz.png',
      type: 'primary'
    },
    secondary: {
      id: 'tickets',
      name: '呼符',
      icon: '/assets/images/games/ticket.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 3
  },

  targetTypes: {
    character: { label: '从者', maxRank: 5, hardPity: 0, guaranteeRate: 0 }
  },

  metadata: {
    category: '卡牌',
    tags: ['Fate', '回合制'],
    hotScore: 75,
    isNew: false,
    isFeatured: false,
    sortKey: 'mingyun',
    publisher: 'TYPE-MOON'
  },

  hardPity: {
    enabled: false,
    count: 300
  }
});
