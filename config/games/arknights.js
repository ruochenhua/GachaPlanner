const { createGameConfig } = require('./_template');

module.exports = createGameConfig('arknights', {
  gameId: 'arknights',
  name: '明日方舟',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  resources: {
    primary: {
      id: 'orundum',
      name: '合成玉',
      icon: '/assets/images/games/orundum.png',
      type: 'primary'
    },
    secondary: {
      id: 'headhuntingPermits',
      name: '寻访凭证',
      icon: '/assets/images/games/headhunting-permit.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 600
  },

  targetTypes: {
    character: { label: '干员', maxRank: 6, hardPity: 0, guaranteeRate: 0 }
  },

  metadata: {
    category: '策略',
    tags: ['塔防', '二次元'],
    hotScore: 80,
    isNew: false,
    isFeatured: false,
    sortKey: 'mingrifangzhou',
    publisher: '鹰角网络'
  },

  hardPity: {
    enabled: false,
    count: 300
  }
});
