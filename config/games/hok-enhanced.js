/**
 * 增强版配置示例 - 王者荣耀（幸运值机制）
 * 基于通用配置模板，展示幸运值累积机制
 */

const { createGameConfig } = require('../config-template-enhanced');

const hokEnhancedConfig = createGameConfig('hok', {
  // 基础信息
  gameId: 'hok',
  name: '王者荣耀',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  // 基础概率（积分夺宝）
  baseRate: 0.005,

  // 幸运值机制详细配置
  luckValue: {
    enabled: true,
    maxValue: 361,             // 满幸运值 = 361
    incrementPerPull: 1,       // 每次失败 +1幸运值
    ratePerLuck: 0.002,        // 每点幸运值增加0.2%概率（可选）
    guaranteeAtMax: true       // 达到361必定成功
  },

  // 资源定义
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

  // 转换率
  conversionRate: {
    primaryToPull: 60          // 60积分 = 1抽
  },

  // 保底继承（幸运值继承）
  pityInheritance: {
    enabled: true,
    crossPool: false,
    expirationDays: 0         // 幸运值永不过期
  },

  // 元数据
  metadata: {
    developer: '腾讯',
    officialUrl: 'https://pvp.qq.com',
    description: 'MOBA类手游',
    tags: ['腾讯', '幸运值机制', '积分夺宝', '硬保底']
  }
});

module.exports = hokEnhancedConfig;