const { createGameConfig } = require('./_template');

module.exports = createGameConfig('mihoyo', {
  gameId: 'genshin',
  name: '原神',
  version: '2.0.0',
  updatedAt: '2026-04-01',

  resources: {
    primary: {
      id: 'primogems',
      name: '原石',
      icon: '/assets/images/games/primogem.png',
      type: 'primary'
    },
    secondary: {
      id: 'intertwinedFates',
      name: '纠缠之缘',
      icon: '/assets/images/games/intertwined-fate.png',
      type: 'secondary'
    }
  },

  conversionRate: {
    primaryToPull: 160
  },

  targetTypes: {
    character: { label: '角色', maxRank: 6, hardPity: 90, guaranteeRate: 0.5 },
    weapon: { label: '武器', maxRank: 5, hardPity: 80, guaranteeRate: 0.75 }
  },

  metadata: {
    category: 'RPG',
    tags: ['开放世界', '二次元'],
    hotScore: 95,
    isNew: false,
    isFeatured: true,
    sortKey: 'yuanshen',
    publisher: 'miHoYo'
  }
});
