/**
 * 游戏配置加载器
 * 负责读取和加载游戏配置文件
 * 支持用户自定义规则设置合并
 */

const { success, error } = require('../utils/result');
const storageService = require('../services/storage-service');

// 静态导入所有游戏配置
const genshinConfig = require('./games/genshin');
const starrailConfig = require('./games/starrail');
const arknightsConfig = require('./games/arknights');
const fgoConfig = require('./games/fgo');
const hokConfig = require('./games/hok');
const onmyojiConfig = require('./games/onmyoji');

// 游戏配置映射
const GAME_CONFIGS = {
  genshin: genshinConfig,
  starrail: starrailConfig,
  arknights: arknightsConfig,
  fgo: fgoConfig,
  hok: hokConfig,
  onmyoji: onmyojiConfig
};

/**
 * 为增强版配置添加兼容层字段
 * 供现有代码（尚未迁移）使用
 * @param {Object} config - 增强版游戏配置
 * @returns {Object} 增强版 + 兼容层字段
 */
function addCompatibilityLayer(config) {
  if (!config) return config;

  const compatResources = {};
  if (config.resources?.primary) {
    compatResources[config.resources.primary.id] = {
      name: config.resources.primary.name,
      icon: config.resources.primary.icon
    };
  }
  if (config.resources?.secondary) {
    compatResources[config.resources.secondary.id] = {
      name: config.resources.secondary.name,
      icon: config.resources.secondary.icon
    };
  }

  return {
    ...config,
    // 兼容层：旧字段名映射
    hardPity: config.hardPity?.count ?? 90,
    softPityStart: config.softPity?.start ?? 74,
    softPityIncrement: config.softPity?.increment ?? 0.06,
    guaranteeRate: config.guarantee?.rate ?? 0.5,
    captureLightRate: config.guarantee?.captureLightRate ?? 0.55,
    primogemsToFate: config.conversionRate?.primaryToPull ?? 160,
    // 兼容层：resources 旧格式
    resources: compatResources
  };
}

/**
 * 加载指定游戏的配置（优先合并用户自定义参数）
 * @param {string} gameId - 游戏ID (如 'genshin', 'starrail')
 * @returns {Object} Result对象 {success, data, error}
 */
function loadGameConfig(gameId) {
  const baseConfig = GAME_CONFIGS[gameId];

  if (!baseConfig) {
    return error(`游戏配置不存在：${gameId}`);
  }

  // 添加兼容层字段
  const configWithCompat = addCompatibilityLayer(baseConfig);

  // 尝试加载用户自定义规则设置
  const customResult = storageService.loadCustomRuleSettings(gameId);
  if (customResult.success && customResult.data && customResult.data.isCustom) {
    // 合并自定义参数到基础配置
    const customSettings = customResult.data;
    const mergedConfig = {
      ...configWithCompat,
      baseRate: customSettings.baseRate ?? configWithCompat.baseRate,
      hardPity: customSettings.hardPity ?? configWithCompat.hardPity,
      softPityStart: customSettings.softPityStart ?? configWithCompat.softPityStart,
      softPityIncrement: customSettings.softPityIncrement ?? configWithCompat.softPityIncrement,
      _isCustom: true,
      _customUpdatedAt: customSettings.updatedAt
    };
    console.log(`✓ 加载自定义规则配置: ${gameId}`);
    return success(mergedConfig);
  }

  return success(configWithCompat);
}

/**
 * 加载原始游戏配置（不含用户自定义，不含兼容层）
 * @param {string} gameId - 游戏ID
 * @returns {Object} Result对象 {success, data, error}
 */
function loadOriginalGameConfig(gameId) {
  const config = GAME_CONFIGS[gameId];

  if (!config) {
    return error(`游戏配置不存在：${gameId}`);
  }

  return success(config);
}

/**
 * 加载所有游戏配置
 * @returns {Object} Result对象 {success, data, error}
 * data为游戏配置对象 {gameId: config}
 */
function loadAllGames() {
  const SUPPORTED_GAMES = ['genshin', 'starrail', 'arknights', 'fgo', 'hok', 'onmyoji'];
  const games = {};

  for (const gameId of SUPPORTED_GAMES) {
    const result = loadGameConfig(gameId);
    if (!result.success) {
      return result; // 返回错误
    }
    games[gameId] = result.data;
  }

  return success(games);
}

module.exports = {
  loadGameConfig,
  loadOriginalGameConfig,
  loadAllGames,
  addCompatibilityLayer
};
