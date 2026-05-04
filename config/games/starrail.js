const { createGameConfig } = require('./_template');

module.exports = createGameConfig('mihoyo', {
  gameId: 'starrail',
  name: '崩坏：星穹铁道',
  version: '2.0.0',
  updatedAt: '2026-04-01',

  resources: {
    primary: {
      id: 'stellarJade',
      name: '星琼',
      icon: '/assets/images/games/stellar-jade.png',
      type: 'primary'
    },
    secondary: {
      id: 'starRailPasses',
      name: '星轨票',
      icon: '/assets/images/games/star-rail-pass.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 160
  },

  targetTypes: {
    character: { label: '角色', maxRank: 6, hardPity: 90, guaranteeRate: 0.5 },
    weapon: { label: '光锥', maxRank: 5, hardPity: 80, guaranteeRate: 0.75 }
  },

  metadata: {
    category: 'RPG',
    tags: ['回合制', '二次元'],
    hotScore: 90,
    isNew: false,
    isFeatured: true,
    sortKey: 'bengtie',
    publisher: 'miHoYo'
  }
});
