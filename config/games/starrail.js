/**
 * 星铁游戏配置
 */
module.exports = {
  gameId: "starrail",
  name: "崩坏：星穹铁道",
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

  resources: {
    stellarJade: {
      name: "星琼",
      icon: "/assets/images/games/stellar-jade.png"
    },
    starRailPasses: {
      name: "星轨票",
      icon: "/assets/images/games/star-rail-pass.png"
    }
  },

  conversionRate: {
    stellarJadeToPass: 160
  },

  characterProbalityUp: 0.5,

  // 目标类型定义（用于规划页目标设定）
  targetTypes: {
    character: { label: '角色', maxRank: 6, hardPity: 90, guaranteeRate: 0.5 },
    weapon: { label: '光锥', maxRank: 5, hardPity: 80, guaranteeRate: 0.75 }
  }
};
