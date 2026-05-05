const { createGameConfig } = require('./_template');

module.exports = createGameConfig('onmyoji', {
  gameId: 'onmyoji',
  name: '阴阳师',
  version: '2.0.0',
  updatedAt: '2026-04-25',

  pityType: 'multi-pool',
  baseRate: 0.01,

  hardPity: {
    enabled: true,
    count: 400,
    resetOnSuccess: true
  },

  multiPool: {
    enabled: true,
    sharedPity: true,
    pools: [
      { poolId: 'spirit-summon', name: '神祭', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 },
      { poolId: 'shrine', name: '神龛', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 },
      { poolId: 'mystery-shop', name: '神秘商人', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 }
    ]
  },

  pityInheritance: {
    enabled: true,
    crossPool: true,
    expirationDays: 0
  },

  resources: {
    primary: {
      id: 'charm',
      name: '勾玉',
      icon: '/assets/images/games/charm.png',
      type: 'primary'
    },
    secondary: {
      id: 'ticket',
      name: '蓝票',
      icon: '/assets/images/games/ticket.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 100
  },

  targetTypes: {
    character: { label: '式神', maxRank: 6, hardPity: 400, guaranteeRate: 0 }
  },

  metadata: {
    category: 'RPG',
    tags: ['回合制', '日式'],
    hotScore: 70,
    isNew: false,
    isFeatured: false,
    sortKey: 'yinshi',
    publisher: '网易'
  },

  hardPity: {
    enabled: true,
    count: 400,
    resetOnSuccess: true
  }
});
