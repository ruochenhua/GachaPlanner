/**
 * 阴阳师配置 - 多池联动机制
 * 神祭/神龛/神秘商人等多池共享 400 抽保底
 */

const { createGameConfig } = require('../config-template-enhanced');

const onmyojiMultiPoolConfig = createGameConfig('onmyoji', {
  // 基础信息
  gameId: 'onmyoji',
  name: '阴阳师',
  version: '2.0.0',
  updatedAt: '2026-04-25',

  // 基础概率
  baseRate: 0.01,

  // 保底类型：多池联动
  pityType: 'multi-pool',

  // 硬保底配置
  hardPity: {
    enabled: true,
    count: 400,
    resetOnSuccess: true
  },

  // 多池联动配置
  multiPool: {
    enabled: true,
    sharedPity: true,
    pools: [
      {
        poolId: 'spirit-summon',
        name: '神祭',
        items: ['SSR 式神', 'SP 式神'],
        upRate: 1.0
      },
      {
        poolId: 'shrine',
        name: '神龛',
        items: ['SSR 式神', 'SP 式神'],
        upRate: 1.0
      },
      {
        poolId: 'mystery-shop',
        name: '神秘商人',
        items: ['SSR 式神', 'SP 式神'],
        upRate: 1.0
      }
    ]
  },

  // 资源定义
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

  // 转换率
  conversionRate: {
    primaryToPull: 100          // 100 勾玉 = 1 抽
  },

  // 保底继承
  pityInheritance: {
    enabled: true,
    crossPool: true,            // 跨池继承
    expirationDays: 0           // 永不过期
  },

  // 元数据
  metadata: {
    developer: '网易',
    officialUrl: 'https://onmyoji.163.com',
    description: '阴阳师多池联动保底机制',
    tags: ['网易', '多池联动', '共享保底', '400 抽必中']
  }
});

module.exports = onmyojiMultiPoolConfig;
