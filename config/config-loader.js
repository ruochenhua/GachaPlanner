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

// 游戏配置映射
const GAME_CONFIGS = {
  genshin: genshinConfig,
  starrail: starrailConfig
};

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

  // 尝试加载用户自定义规则设置
  const customResult = storageService.loadCustomRuleSettings(gameId);
  if (customResult.success && customResult.data && customResult.data.isCustom) {
    // 合并自定义参数到基础配置
    const customSettings = customResult.data;
    const mergedConfig = {
      ...baseConfig,
      baseRate: customSettings.baseRate ?? baseConfig.baseRate,
      hardPity: customSettings.hardPity ?? baseConfig.hardPity,
      softPityStart: customSettings.softPityStart ?? baseConfig.softPityStart,
      softPityIncrement: customSettings.softPityIncrement ?? baseConfig.softPityIncrement,
      _isCustom: true,
      _customUpdatedAt: customSettings.updatedAt
    };
    console.log(`✓ 加载自定义规则配置: ${gameId}`);
    return success(mergedConfig);
  }

  return success(baseConfig);
}

/**
 * 加载原始游戏配置（不含用户自定义）
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
  const SUPPORTED_GAMES = ['genshin', 'starrail'];
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
  loadAllGames
};
