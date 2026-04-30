/**
 * 游戏配置预设模板库
 * 包含 10+ 热门游戏的完整配置模板
 */

const { createGameConfig, GAME_TEMPLATES } = require('../../config-template-enhanced');

// 添加 'hard' 模板类型支持（用于 NIKKE、鸣潮等简单硬保底游戏）
GAME_TEMPLATES.hard = {
  pityType: 'hard',
  baseRate: 0.02,
  hardPity: {
    enabled: true,
    count: 90,
    resetOnSuccess: true
  },
  softPity: { enabled: false },
  guarantee: { enabled: false },
  luckValue: { enabled: false },
  multiPool: { enabled: false, pools: [] },
  pityInheritance: {
    enabled: true,
    crossPool: false,
    expirationDays: 0
  }
};

/**
 * 预设模板列表
 */
const PRESET_LIBRARY = [
  // ========== 米哈游系游戏 ==========
  {
    id: 'genshin-impact',
    name: '原神',
    category: 'mihoyo',
    tags: ['米哈游', '硬保底', '大小保底', '90 抽必中'],
    config: createGameConfig('mihoyo', {
      gameId: 'genshin',
      name: '原神',
      version: '5.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.006,
      hardPity: { count: 90 },
      guarantee: {
        enabled: true,
        rate: 0.5,
        captureLight: true,      // 5.0 版本新增捕获明光机制
        captureLightRate: 0.55
      },
      resources: {
        primary: { id: 'genesis', name: '创世结晶', type: 'primary' },
        secondary: { id: 'intertwinedFates', name: '纠缠之缘', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 160 },
      metadata: {
        developer: '米哈游',
        officialUrl: 'https://ys.mihoyo.com',
        description: '原神角色/武器池保底机制',
        tags: ['米哈游', '硬保底', '大小保底', '捕获明光']
      }
    })
  },

  {
    id: 'starrail',
    name: '崩坏：星穹铁道',
    category: 'mihoyo',
    tags: ['米哈游', '硬保底', '大小保底', '90 抽必中'],
    config: createGameConfig('mihoyo', {
      gameId: 'starrail',
      name: '崩坏：星穹铁道',
      version: '2.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.006,
      hardPity: { count: 90 },
      guarantee: {
        enabled: true,
        rate: 0.5,
        captureLight: false,     // 星铁没有捕获明光机制
        captureLightRate: 0
      },
      resources: {
        primary: { id: 'jade', name: '星琼', type: 'primary' },
        secondary: { id: 'pass', name: '星轨专票', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 160 },
      metadata: {
        developer: '米哈游',
        officialUrl: 'https://sr.mihoyo.com',
        description: '崩坏：星穹铁道角色/光锥池保底机制',
        tags: ['米哈游', '硬保底', '大小保底']
      }
    })
  },

  {
    id: 'zenless',
    name: '绝区零',
    category: 'mihoyo',
    tags: ['米哈游', '硬保底', '大小保底', '90 抽必中'],
    config: createGameConfig('mihoyo', {
      gameId: 'zenless',
      name: '绝区零',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.006,
      hardPity: { count: 90 },
      guarantee: {
        enabled: true,
        rate: 0.5,
        captureLight: false,
        captureLightRate: 0
      },
      resources: {
        primary: { id: 'polychrome', name: '菲林', type: 'primary' },
        secondary: { id: 'binding', name: '绑定的菲林', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 160 },
      metadata: {
        developer: '米哈游',
        officialUrl: 'https://zzz.mihoyo.com',
        description: '绝区零代理人/音擎池保底机制',
        tags: ['米哈游', '硬保底', '大小保底']
      }
    })
  },

  // ========== 网易系游戏 ==========
  {
    id: 'onmyoji',
    name: '阴阳师',
    category: 'netease',
    tags: ['网易', '多池联动', '共享保底', '400 抽必中'],
    config: createGameConfig('onmyoji', {
      gameId: 'onmyoji',
      name: '阴阳师',
      version: '2.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.01,
      hardPity: { count: 400 },
      multiPool: {
        enabled: true,
        sharedPity: true,
        pools: [
          { poolId: 'spirit-summon', name: '神祭', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 },
          { poolId: 'shrine', name: '神龛', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 },
          { poolId: 'mystery-shop', name: '神秘商人', items: ['SSR 式神', 'SP 式神'], upRate: 1.0 }
        ]
      },
      resources: {
        primary: { id: 'charm', name: '勾玉', type: 'primary' },
        secondary: { id: 'ticket', name: '蓝票', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 100 },
      metadata: {
        developer: '网易',
        officialUrl: 'https://onmyoji.163.com',
        description: '阴阳师多池联动保底机制',
        tags: ['网易', '多池联动', '共享保底', '400 抽必中']
      }
    })
  },

  {
    id: 'hok',
    name: '王者荣耀',
    category: 'tencent',
    tags: ['腾讯', '幸运值', '361 抽必中'],
    config: createGameConfig('hok', {
      gameId: 'hok',
      name: '王者荣耀',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.005,
      luckValue: {
        enabled: true,
        maxValue: 361,
        incrementPerPull: 1,
        ratePerLuck: 0.002,
        guaranteeAtMax: true
      },
      resources: {
        primary: { id: 'coupon', name: '荣耀水晶券', type: 'primary' },
        secondary: { id: 'diamond', name: '钻石', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 1 },
      metadata: {
        developer: '腾讯',
        officialUrl: 'https://pvp.qq.com',
        description: '王者荣耀荣耀水晶幸运值机制',
        tags: ['腾讯', '幸运值', '361 抽必中']
      }
    })
  },

  // ========== 其他热门游戏 ==========
  {
    id: 'arknights',
    name: '明日方舟',
    category: 'other',
    tags: ['鹰角', '软保底', '无硬保底'],
    config: createGameConfig('arknights', {
      gameId: 'arknights',
      name: '明日方舟',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.02,
      softPity: {
        enabled: true,
        start: 50,
        increment: 0.02,
        maxRate: 1.0
      },
      resources: {
        primary: { id: 'orundum', name: '合成玉', type: 'primary' },
        secondary: { id: 'ticket', name: '寻访凭证', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 600 },
      metadata: {
        developer: '鹰角网络',
        officialUrl: 'https://ak.hypergryph.com',
        description: '明日方舟软保底机制',
        tags: ['鹰角', '软保底', '无硬保底']
      }
    })
  },

  {
    id: 'fgo',
    name: 'Fate/Grand Order',
    category: 'other',
    tags: ['型月', '无保底', '纯随机'],
    config: createGameConfig('fgo', {
      gameId: 'fgo',
      name: 'Fate/Grand Order',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.01,
      pityType: 'none',
      resources: {
        primary: { id: 'quartz', name: '圣晶石', type: 'primary' },
        secondary: { id: 'ticket', name: '呼符', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 1 },
      metadata: {
        developer: 'DELiGHTWORKS/Aniplex',
        officialUrl: 'https://www.fate-go.jp',
        description: 'Fate/Grand Order 纯随机抽卡',
        tags: ['型月', '无保底', '纯随机']
      }
    })
  },

  {
    id: 'nikke',
    name: '胜利女神：NIKKE',
    category: 'other',
    tags: ['Level Infinite', '硬保底', '200 抽必中'],
    config: createGameConfig('hard', {
      gameId: 'nikke',
      name: '胜利女神：NIKKE',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.02,
      hardPity: {
        enabled: true,
        count: 200,
        resetOnSuccess: true
      },
      resources: {
        primary: { id: 'gem', name: '宝石', type: 'primary' },
        secondary: { id: 'ticket', name: '特供券', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 10 },
      metadata: {
        developer: 'Shift Up',
        officialUrl: 'https://nikke-shiftup.net',
        description: '胜利女神：NIKKE 保底机制',
        tags: ['Level Infinite', '硬保底', '200 抽必中']
      }
    })
  },

  {
    id: 'wuthering-waves',
    name: '鸣潮',
    category: 'other',
    tags: ['库洛', '硬保底', '大小保底', '80 抽必中'],
    config: createGameConfig('hard', {
      gameId: 'wuthering-waves',
      name: '鸣潮',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.008,
      hardPity: {
        enabled: true,
        count: 80,
        resetOnSuccess: true
      },
      guarantee: {
        enabled: true,
        rate: 0.5,
        captureLight: false,
        captureLightRate: 0
      },
      resources: {
        primary: { id: 'tide', name: '星声', type: 'primary' },
        secondary: { id: 'wave', name: '限定深潜回音', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 160 },
      metadata: {
        developer: '库洛游戏',
        officialUrl: 'https://wutheringwaves.kurogame.com',
        description: '鸣潮角色/武器池保底机制',
        tags: ['库洛', '硬保底', '大小保底', '80 抽必中']
      }
    })
  },

  {
    id: 'punishing-gray-raven',
    name: '战双帕弥什',
    category: 'other',
    tags: ['库洛', '硬保底', '60 抽必中'],
    config: createGameConfig('hard', {
      gameId: 'punishing-gray-raven',
      name: '战双帕弥什',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.025,
      hardPity: {
        enabled: true,
        count: 60,
        resetOnSuccess: true
      },
      resources: {
        primary: { id: 'blackcard', name: '黑卡', type: 'primary' },
        secondary: { id: 'ticket', name: '基准角色研发券', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 1 },
      metadata: {
        developer: '库洛游戏',
        officialUrl: 'https://pgr.kurogame.com',
        description: '战双帕弥什角色池保底机制',
        tags: ['库洛', '硬保底', '60 抽必中']
      }
    })
  },

  {
    id: 'blue-archive',
    name: '蔚蓝档案',
    category: 'other',
    tags: ['Nexon', '硬保底', '200 抽必中', '天井'],
    config: createGameConfig('hard', {
      gameId: 'blue-archive',
      name: '蔚蓝档案',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.03,
      hardPity: {
        enabled: true,
        count: 200,
        resetOnSuccess: true
      },
      resources: {
        primary: { id: 'pyroxene', name: '青辉石', type: 'primary' },
        secondary: { id: 'ticket', name: '招募券', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 10 },
      metadata: {
        developer: 'Nexon Games',
        officialUrl: 'https://bluearchive.yostar.co.jp',
        description: '蔚蓝档案天井保底机制',
        tags: ['Nexon', '硬保底', '200 抽必中', '天井']
      }
    })
  },

  {
    id: 'girls-frontline-2',
    name: '少女前线 2：追放',
    category: 'other',
    tags: ['散爆网络', '硬保底', '大小保底', '80 抽必中'],
    config: createGameConfig('hard', {
      gameId: 'girls-frontline-2',
      name: '少女前线 2：追放',
      version: '1.0.0',
      updatedAt: '2026-04-25',
      baseRate: 0.015,
      hardPity: {
        enabled: true,
        count: 80,
        resetOnSuccess: true
      },
      guarantee: {
        enabled: true,
        rate: 0.5,
        captureLight: false,
        captureLightRate: 0
      },
      resources: {
        primary: { id: 'redstar', name: '红星币', type: 'primary' },
        secondary: { id: 'ticket', name: '高级招募凭证', type: 'secondary' }
      },
      conversionRate: { primaryToPull: 1 },
      metadata: {
        developer: '散爆网络',
        officialUrl: 'https://gf2.sunborngame.com',
        description: '少女前线 2 角色池保底机制',
        tags: ['散爆网络', '硬保底', '大小保底', '80 抽必中']
      }
    })
  }
];

/**
 * 获取预设模板列表
 * @returns {Array} 预设模板列表
 */
function getPresetList() {
  return PRESET_LIBRARY.map(preset => ({
    id: preset.id,
    name: preset.name,
    category: preset.category,
    tags: preset.tags
  }));
}

/**
 * 获取预设模板详情
 * @param {string} presetId - 预设 ID
 * @returns {Object|null} 预设详情
 */
function getPresetDetail(presetId) {
  const preset = PRESET_LIBRARY.find(p => p.id === presetId);
  return preset ? { ...preset } : null;
}

/**
 * 按分类获取预设模板
 * @param {string} category - 分类
 * @returns {Array} 预设模板列表
 */
function getPresetsByCategory(category) {
  return PRESET_LIBRARY.filter(preset => preset.category === category);
}

/**
 * 按标签搜索预设模板
 * @param {string} tag - 标签
 * @returns {Array} 预设模板列表
 */
function getPresetsByTag(tag) {
  return PRESET_LIBRARY.filter(preset => preset.tags.includes(tag));
}

/**
 * 获取所有分类列表
 * @returns {Array} 分类列表
 */
function getCategories() {
  const categories = new Set(PRESET_LIBRARY.map(preset => preset.category));
  return Array.from(categories);
}

/**
 * 获取所有标签列表
 * @returns {Array} 标签列表
 */
function getAllTags() {
  const tags = new Set();
  PRESET_LIBRARY.forEach(preset => {
    preset.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

module.exports = {
  PRESET_LIBRARY,
  getPresetList,
  getPresetDetail,
  getPresetsByCategory,
  getPresetsByTag,
  getCategories,
  getAllTags
};
