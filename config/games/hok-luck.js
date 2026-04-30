/**
 * 王者荣耀配置 - 幸运值机制
 * 积分夺宝：幸运值 0-360，361 抽必中
 */

const { createGameConfig } = require('../config-template-enhanced');

const hokLuckConfig = createGameConfig('hok', {
  // 基础信息
  gameId: 'hok',
  name: '王者荣耀',
  version: '2.0.0',
  updatedAt: '2026-04-25',

  // 基础概率（积分夺宝）
  baseRate: 0.005,

  // 保底类型：幸运值
  pityType: 'luck',

  // 幸运值机制详细配置
  luckValue: {
    enabled: true,
    maxValue: 361,             // 满幸运值 = 361
    incrementPerPull: 1,       // 每次失败 +1 幸运值
    ratePerLuck: 0.002,        // 每点幸运值增加 0.2% 概率
    guaranteeAtMax: true       // 达到 361 必定成功
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
    primaryToPull: 60          // 60 积分 = 1 抽
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
    description: 'MOBA 类手游，积分夺宝幸运值机制',
    tags: ['腾讯', '幸运值机制', '积分夺宝', '硬保底']
  }
});

module.exports = hokLuckConfig;
