/**
 * 增强版配置示例 - 明日方舟
 * 基于通用配置模板，展示软保底无大小保底机制
 */

const { createGameConfig } = require('../config-template-enhanced');

const arknightsEnhancedConfig = createGameConfig('arknights', {
  // 基础信息
  gameId: 'arnights',
  name: '明日方舟',
  version: '2.0.0',
  updatedAt: '2026-04-19',

  // 资源定义
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

  // 转换率
  conversionRate: {
    primaryToPull: 600        // 600合成玉 = 1抽
  },

  // 元数据
  metadata: {
    developer: '鹰角网络',
    officialUrl: 'https://ak.hypergryph.com',
    description: '策略向即时战术手游',
    tags: ['鹰角网络', '软保底', '无硬保底', '无大小保底']
  }
});

module.exports = arknightsEnhancedConfig;