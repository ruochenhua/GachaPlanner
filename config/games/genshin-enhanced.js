/**
 * 增强版配置示例 - 原神
 * 基于通用配置模板，包含完整的保底机制定义
 */

const { createGameConfig } = require('./config-template-enhanced');

const genshinEnhancedConfig = createGameConfig('mihoyo', {
  // 基础信息
  gameId: 'genshin',
  name: '原神',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  // 捕获明光机制（原神5.0新增）
  guarantee: {
    enabled: true,
    rate: 0.5,
    captureLight: true,        // 启用捕获明光
    captureLightRate: 0.55     // 连续歪后UP概率提升到55%
  },

  // 资源定义
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

  // 转换率
  conversionRate: {
    primaryToPull: 160        // 160原石 = 1抽
  },

  // 卡池定义
  multiPool: {
    enabled: true,
    sharedPity: false,        // 角色池和武器池保底不共享
    pools: [
      {
        poolId: 'character',
        name: '角色祈愿',
        items: ['5星角色', '4星角色', '4星武器'],
        pityType: 'guarantee'
      },
      {
        poolId: 'weapon',
        name: '武器祈愿',
        items: ['5星武器', '4星武器'],
        pityType: 'hard',
        guaranteeRate: 0.75    // 武器池定轨机制
      }
    ]
  },

  // 元数据
  metadata: {
    developer: '米哈游',
    officialUrl: 'https://genshin.hoyoverse.com',
    description: '开放世界冒险游戏',
    tags: ['米哈游', '硬保底', '软保底', '大小保底', '捕获明光']
  }
});

module.exports = genshinEnhancedConfig;