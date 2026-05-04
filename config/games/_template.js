/**
 * 增强版通用配置模板
 * 基于主流抽卡游戏调研结果设计，支持所有常见机制
 */

const CONFIG_TEMPLATE = {
  // ===== 必填字段 =====
  gameId: '',                  // 游戏唯一标识
  name: '',                    // 游戏名称
  version: '1.0.0',            // 配置版本
  updatedAt: '',               // 更新日期 (YYYY-MM-DD)

  // ===== 保底机制核心参数 =====
  pityType: 'none',            // 保底类型: hard, soft, none, guarantee, luck, multi-pool
  baseRate: 0.01,              // 基础概率 (0.001 - 1.0)

  // ===== 硬保底配置 =====
  hardPity: {
    enabled: false,            // 是否启用硬保底
    count: 90,                 // 硬保底抽数 (1 - 1000)
    resetOnSuccess: true       // 成功后是否重置计数器
  },

  // ===== 软保底配置 =====
  softPity: {
    enabled: false,            // 是否启用软保底
    start: 74,                 // 软保底起始抽数
    increment: 0.06,           // 每抽概率增量
    maxRate: 1.0               // 最大概率上限
  },

  // ===== 大小保底配置 =====
  guarantee: {
    enabled: false,            // 是否启用大小保底
    rate: 0.5,                 // 小保底UP概率
    captureLight: false,       // 是否启用捕获明光机制（原神5.0+）
    captureLightRate: 0.55     // 捕获明光UP概率
  },

  // ===== 幸运值机制配置（王者荣耀类） =====
  luckValue: {
    enabled: false,            // 是否启用幸运值机制
    maxValue: 361,             // 幸运值上限
    incrementPerPull: 1,       // 每次失败增加的幸运值
    ratePerLuck: 0,            // 每点幸运值增加的概率（可选）
    guaranteeAtMax: true       // 达到上限是否必定成功
  },

  // ===== 多池联动配置（阴阳师类） =====
  multiPool: {
    enabled: false,            // 是否启用多池联动
    sharedPity: false,         // 是否共享保底计数
    pools: []                  // 卡池列表 [{poolId, name, items}]
  },

  // ===== 保底继承配置 =====
  pityInheritance: {
    enabled: true,             // 是否允许保底继承
    crossPool: false,          // 是否跨池继承
    expirationDays: 0          // 保底计数过期天数（0=永不过期）
  },

  // ===== 资源定义 =====
  resources: {
    // 主要资源（需转换为抽数）
    primary: {
      id: '',                  // 资源ID
      name: '',                 // 资源名称
      icon: '',                 // 图标路径
      type: 'primary'           // 资源类型
    },
    // 次要资源（直接用于抽卡）
    secondary: {
      id: '',                  // 资源ID（如 intertwinedFates）
      name: '',                 // 资源名称（如 纠缠之缘）
      icon: '',
      type: 'secondary'
    }
  },

  // ===== 资源转换率 =====
  conversionRate: {
    primaryToPull: 160         // 主要资源转换为抽卡次数的比率
  },

  // ===== 额外参数 =====
  metadata: {
    developer: '',             // 游戏开发商
    officialUrl: '',           // 官方网站
    description: '',           // 游戏描述
    tags: []                   // 标签（如 ['米哈游', '硬保底', '大小保底']）
  }
};

/**
 * 预设游戏模板
 */
const GAME_TEMPLATES = {
  // 米哈游系模板（原神/崩铁/绝区零）
  mihoyo: {
    pityType: 'guarantee',
    baseRate: 0.006,

    hardPity: {
      enabled: true,
      count: 90,
      resetOnSuccess: true
    },

    softPity: {
      enabled: true,
      start: 74,
      increment: 0.06,
      maxRate: 1.0
    },

    guarantee: {
      enabled: true,
      rate: 0.5,
      captureLight: false,
      captureLightRate: 0.55
    },

    pityInheritance: {
      enabled: true,
      crossPool: false,
      expirationDays: 0
    }
  },

  // 明日方舟模板
  arknights: {
    pityType: 'soft',
    baseRate: 0.02,

    hardPity: {
      enabled: false
    },

    softPity: {
      enabled: true,
      start: 50,
      increment: 0.02,
      maxRate: 1.0
    },

    guarantee: {
      enabled: false
    },

    pityInheritance: {
      enabled: false,
      crossPool: false
    }
  },

  // FGO模板（无保底）
  fgo: {
    pityType: 'none',
    baseRate: 0.01,

    hardPity: {
      enabled: false
    },

    softPity: {
      enabled: false
    },

    guarantee: {
      enabled: false
    },

    pityInheritance: {
      enabled: false,
      crossPool: false
    }
  },

  // 王者荣耀模板（幸运值机制）
  hok: {
    pityType: 'luck',
    baseRate: 0.005,

    hardPity: {
      enabled: false
    },

    softPity: {
      enabled: false
    },

    guarantee: {
      enabled: false
    },

    luckValue: {
      enabled: true,
      maxValue: 361,
      incrementPerPull: 1,
      ratePerLuck: 0,
      guaranteeAtMax: true
    },

    pityInheritance: {
      enabled: true,
      crossPool: false
    }
  },

  // 阴阳师模板（多池联动）
  onmyoji: {
    pityType: 'multi-pool',
    baseRate: 0.01,

    hardPity: {
      enabled: true,
      count: 400,
      resetOnSuccess: true
    },

    softPity: {
      enabled: false
    },

    guarantee: {
      enabled: false
    },

    multiPool: {
      enabled: true,
      sharedPity: true,
      pools: []
    },

    pityInheritance: {
      enabled: true,
      crossPool: true
    }
  }
};

/**
 * 创建游戏配置
 * @param {string} templateType - 模板类型 (mihoyo, arknights, fgo, hok, onmyoji)
 * @param {Object} customConfig - 自定义配置覆盖
 * @returns {Object} 完整游戏配置
 */
function createGameConfig(templateType, customConfig) {
  const template = GAME_TEMPLATES[templateType] || GAME_TEMPLATES.fgo;
  const config = deepMerge(CONFIG_TEMPLATE, template);

  if (customConfig) {
    return deepMerge(config, customConfig);
  }

  return config;
}

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * 验证配置完整性
 * @param {Object} config - 游戏配置
 * @returns {Object} {valid, errors}
 */
function validateEnhancedConfig(config) {
  const errors = [];

  // 必填字段验证
  if (!config.gameId) errors.push('gameId 是必填字段');
  if (!config.name) errors.push('name 是必填字段');
  if (!config.baseRate || config.baseRate < 0.001 || config.baseRate > 1.0) {
    errors.push('baseRate 必须在 0.001 - 1.0 之间');
  }

  // 保底类型验证
  const validPityTypes = ['none', 'hard', 'soft', 'guarantee', 'luck', 'multi-pool'];
  if (!validPityTypes.includes(config.pityType)) {
    errors.push(`pityType 必须是: ${validPityTypes.join(', ')}`);
  }

  // 硬保底验证
  if (config.hardPity.enabled) {
    if (!config.hardPity.count || config.hardPity.count < 1 || config.hardPity.count > 1000) {
      errors.push('hardPity.count 必须在 1 - 1000 之间');
    }
  }

  // 软保底验证
  if (config.softPity.enabled) {
    if (!config.softPity.start || config.softPity.start < 1) {
      errors.push('softPity.start 必须大于 0');
    }
    if (!config.softPity.increment || config.softPity.increment <= 0) {
      errors.push('softPity.increment 必须大于 0');
    }
  }

  // 大小保底验证
  if (config.guarantee.enabled) {
    if (!config.guarantee.rate || config.guarantee.rate < 0.01 || config.guarantee.rate > 1.0) {
      errors.push('guarantee.rate 必须在 0.01 - 1.0 之间');
    }
    // 捕获明光机制验证
    if (config.guarantee.captureLight) {
      if (!config.guarantee.captureLightRate ||
          config.guarantee.captureLightRate < 0.01 ||
          config.guarantee.captureLightRate > 1.0) {
        errors.push('guarantee.captureLightRate 必须在 0.01 - 1.0 之间');
      }
    }
  }

  // 幸运值验证
  if (config.luckValue.enabled) {
    if (!config.luckValue.maxValue || config.luckValue.maxValue < 1) {
      errors.push('luckValue.maxValue 必须大于 0');
    }
    // 验证幸运值增量
    if (config.luckValue.incrementPerPull && config.luckValue.incrementPerPull < 0) {
      errors.push('luckValue.incrementPerPull 不能为负数');
    }
    // 验证每点幸运值增加的概率
    if (config.luckValue.ratePerLuck &&
        (config.luckValue.ratePerLuck < 0 || config.luckValue.ratePerLuck > 1.0)) {
      errors.push('luckValue.ratePerLuck 必须在 0 - 1.0 之间');
    }
  }

  // 多池联动验证
  if (config.multiPool.enabled) {
    if (!config.multiPool.pools || config.multiPool.pools.length === 0) {
      errors.push('multiPool.pools 必须至少有一个卡池');
    } else {
      // 验证每个卡池的结构
      config.multiPool.pools.forEach((pool, index) => {
        if (!pool.poolId) {
          errors.push(`multiPool.pools[${index}] 缺少 poolId`);
        }
        if (!pool.name) {
          errors.push(`multiPool.pools[${index}] 缺少 name`);
        }
        // 验证 UP 率（如果有）
        if (pool.upRate !== undefined &&
            (pool.upRate < 0 || pool.upRate > 1.0)) {
          errors.push(`multiPool.pools[${index}].upRate 必须在 0 - 1.0 之间`);
        }
      });
    }
  }

  // 资源验证
  if (!config.resources || !config.resources.primary) {
    errors.push('resources.primary 是必填字段');
  }

  // 转换率验证
  if (config.resources.primary && !config.conversionRate.primaryToPull) {
    errors.push('conversionRate.primaryToPull 是必填字段');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 导出配置为JSON
 * @param {Object} config - 游戏配置
 * @returns {string} JSON字符串
 */
function exportConfig(config) {
  const exportData = {
    version: '2.0.0',  // 增强版配置版本
    exportedAt: new Date().toISOString(),
    config: config,
    checksum: generateChecksum(config)
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 导入配置
 * @param {string} jsonStr - JSON字符串
 * @returns {Object} {success, config, error}
 */
function importConfig(jsonStr) {
  try {
    const importData = JSON.parse(jsonStr);

    // 版本兼容性检查
    if (!importData.version) {
      return { success: false, error: '缺少版本信息' };
    }

    // checksum验证
    if (importData.checksum) {
      const expectedChecksum = generateChecksum(importData.config);
      if (importData.checksum !== expectedChecksum) {
        return { success: false, error: '配置校验失败，可能已被篡改' };
      }
    }

    // 配置验证
    const validation = validateEnhancedConfig(importData.config);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    return { success: true, config: importData.config };
  } catch (err) {
    return { success: false, error: `JSON解析失败: ${err.message}` };
  }
}

/**
 * 生成配置checksum
 * @param {Object} config - 游戏配置
 * @returns {string} checksum
 */
function generateChecksum(config) {
  // 简化版checksum（实际应使用 crypto.createHash('sha256')）
  const str = JSON.stringify(config);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

module.exports = {
  CONFIG_TEMPLATE,
  GAME_TEMPLATES,
  createGameConfig,
  validateEnhancedConfig,
  exportConfig,
  importConfig,
  deepMerge
};