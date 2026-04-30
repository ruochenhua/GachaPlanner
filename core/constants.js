/**
 * 核心常量定义
 * 集中管理魔法数字和常用常量
 */

module.exports = {
  // ===== 概率计算常量 =====

  // 概率阈值
  PROBABILITY_THRESHOLD: 0.9999,    // 累积概率上限阈值（达到此值后停止计算）

  // 保底计数
  MAX_PITY_COUNT: 1000,             // 最大保底计数上限
  MIN_PITY_COUNT: 1,                // 最小保底计数下限

  // ===== 幸运值常量（王者荣耀） =====

  LUCK_VALUE: {
    DEFAULT_MAX: 361,               // 默认幸运值上限
    DEFAULT_INCREMENT: 1,           // 每抽失败增加幸运值
    DEFAULT_RATE_PER_LUCK: 0.002,   // 每点幸运值增加的概率
    MIN_MAX_VALUE: 1,               // 幸运值上限最小值
    MAX_MAX_VALUE: 999              // 幸运值上限最大值
  },

  // ===== 多池联动常量（阴阳师） =====

  MULTI_POOL: {
    DEFAULT_MAX_PITY: 400,          // 默认 400 抽必中
    MIN_POOLS: 1,                   // 最少卡池数
    MAX_POOLS: 10                   // 最多卡池数
  },

  // ===== 资源转换常量 =====

  RESOURCE: {
    DEFAULT_CONVERSION_RATE: 160,   // 默认原石转换率（原神）
    MIN_CONVERSION_RATE: 1,         // 最小转换率
    MAX_CONVERSION_RATE: 10000      // 最大转换率
  },

  // ===== 数据存储常量 =====

  STORAGE: {
    KEY_PREFIX: 'gacha_planning_',  // 存储键前缀
    DATA_VERSION: '1.0.0',          // 数据版本号
    DEFAULT_BATCH_SIZE: 10,         // 批量加载默认批次大小
    MAX_BATCH_SIZE: 50              // 最大批量加载大小
  },

  // ===== 配置模板常量 =====

  CONFIG: {
    VERSION: '1.0.0',               // 配置模板版本
    MIN_BASE_RATE: 0.001,           // 最小基础概率
    MAX_BASE_RATE: 1.0,             // 最大基础概率（100%）
    VALID_PITY_TYPES: ['none', 'hard', 'soft', 'guarantee', 'luck', 'multi-pool']
  },

  // ===== 抽卡常量 =====

  PULL: {
    SINGLE_PULL: 1,                 // 单抽
    MULTI_PULL_10: 10,              // 十连
    MAX_PULLS_PER_BATCH: 1000       // 单次最大计算抽数
  },

  // ===== 统计指标常量 =====

  STATISTICS: {
    PERCENTILES: {                  // 常用分位数
      P50: 0.5,
      P90: 0.9,
      P95: 0.95,
      P99: 0.99
    }
  }
};
