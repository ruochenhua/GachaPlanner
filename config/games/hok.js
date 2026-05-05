const { createGameConfig } = require('./_template');

module.exports = createGameConfig('hok', {
  gameId: 'hok',
  name: '王者荣耀',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  pityType: 'luck',
  baseRate: 0.005,

  luckValue: {
    enabled: true,
    maxValue: 361,
    incrementPerPull: 1,
    ratePerLuck: 0.002,
    guaranteeAtMax: true
  },

  resources: {
    primary: {
      id: 'tokens',
      name: '积分',
      icon: '/assets/images/games/tokens.png',
      type: 'primary'
    },
    secondary: {
      id: 'crystals',
      name: '水晶',
      icon: '/assets/images/games/crystal.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 60
  },

  targetTypes: {
    character: { label: '皮肤', maxRank: 1, hardPity: 361, guaranteeRate: 0 }
  },

  metadata: {
    category: '休闲',
    tags: ['MOBA', '幸运值'],
    hotScore: 98,
    isNew: false,
    isFeatured: true,
    sortKey: 'wangzhe',
    publisher: '腾讯'
  },

  hardPity: {
    enabled: false,
    count: 361
  }
});
