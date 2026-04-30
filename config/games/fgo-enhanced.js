/**
 * 增强版配置示例 - FGO
 * 基于通用配置模板，展示无保底机制
 */

const { createGameConfig } = require('../config-template-enhanced');

const fgoEnhancedConfig = createGameConfig('fgo', {
  // 基础信息
  gameId: 'fgo',
  name: '命运-冠位指定',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  // 资源定义
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

  // 转换率
  conversionRate: {
    primaryToPull: 3          // 3圣晶石 = 1抽
  },

  // 元数据
  metadata: {
    developer: 'TYPE-MOON',
    officialUrl: 'https://fate-go.jp',
    description: ' Fate系列首款智能手机专用游戏',
    tags: ['TYPE-MOON', '无保底', '纯概率', '赌狗游戏']
  }
});

module.exports = fgoEnhancedConfig;