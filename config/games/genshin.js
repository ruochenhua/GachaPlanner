/**
 * 原神游戏配置
 */
module.exports = {
  gameId: "genshin",
  name: "原神",
  version: "1.0.0",
  updatedAt: "2026-04-01",

  pityType: "hard",
  hardPity: 90,
  softPityStart: 74,

  baseRate: 0.006,
  softPityIncrement: 0.06,

  // 大小保底机制
  // guaranteeRate: UP角色概率（小保底时），大保底时为100%
  guaranteeRate: 0.5,
  // 捕获明光机制（原神5.0新增）- 连续歪的情况下第二次歪概率降低
  // captureLight: 连续歪后UP概率提升（待实现）
  captureLightRate: 0.55, // 第二次歪时UP概率提升到55%

  resources: {
    primogems: {
      name: "原石",
      icon: "/assets/images/games/primogem.png"
    },
    intertwinedFates: {
      name: "纠缠之缘",
      icon: "/assets/images/games/intertwined-fate.png"
    }
  },

  conversionRate: {
    primogemsToFate: 160
  },

  characterProbalityUp: 0.5,
  weaponProbalityUp: 0.75,

  // 目标类型定义（用于规划页目标设定）
  targetTypes: {
    character: { label: '角色', maxRank: 6, hardPity: 90, guaranteeRate: 0.5 },
    weapon: { label: '武器', maxRank: 5, hardPity: 80, guaranteeRate: 0.75 }
  }
};
