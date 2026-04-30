/**
 * 游戏管理服务
 * 提供游戏切换、资源获取和更新功能
 */

const { success, error } = require('../utils/result');
const storageService = require('./storage-service');
const configLoader = require('../config/config-loader');

/**
 * 游戏管理服务类
 */
class GameService {
  constructor() {
    this.storageService = storageService;
    this.configLoader = configLoader;
    this.currentGameId = null;
  }

  /**
   * 切换游戏
   * @param {string} gameId - 目标游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  switchGame(gameId) {
    console.log(`切换游戏: ${gameId}`);

    // 1. 验证目标游戏存在
    if (!this.isGameSupported(gameId)) {
      return error(`不支持的游戏：${gameId}`);
    }

    // 2. 保存当前游戏数据（如有）
    if (this.currentGameId && this.currentGameId !== gameId) {
      console.log(`保存当前游戏数据: ${this.currentGameId}`);
      const currentResources = this.storageService.loadCurrentGameResources(this.currentGameId);
      if (currentResources.success) {
        this.storageService.updateResources(this.currentGameId, currentResources.data);
      }
    }

    // 3. 更新currentGameId
    this.currentGameId = gameId;

    // 4. 加载新游戏资源数据
    const resourcesResult = this.storageService.loadCurrentGameResources(gameId);
    if (!resourcesResult.success) {
      return resourcesResult;
    }

    // 5. 更新用户数据的currentGameId
    const userDataResult = this.storageService.load();
    if (userDataResult.success) {
      userDataResult.data.currentGameId = gameId;
      this.storageService.save(userDataResult.data);
    }

    console.log(`✓ 切换游戏成功: ${gameId}`);
    return success({
      gameId,
      resources: resourcesResult.data
    });
  }

  /**
   * 获取当前游戏资源
   * @returns {Object} Result对象 {success, data, error}
   */
  getCurrentResources() {
    const gameId = this.getCurrentGameId();
    if (!gameId) {
      return error('未设置当前游戏');
    }

    return this.storageService.loadCurrentGameResources(gameId);
  }

  /**
   * 获取指定游戏的资源
   * @param {string} gameId - 游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  getGameResources(gameId) {
    if (!gameId) {
      return error('游戏ID不能为空');
    }

    if (!this.isGameSupported(gameId)) {
      return error(`不支持的游戏：${gameId}`);
    }

    return this.storageService.loadCurrentGameResources(gameId);
  }

  /**
   * 更新资源数据
   * @param {string} gameId - 游戏ID（可选，不传则使用当前游戏）
   * @param {Object} resources - 资源数据
   * @returns {Object} Result对象 {success, data, error}
   */
  updateResources(gameId, resources) {
    // 兼容单参数调用：updateResources(resources)
    if (typeof gameId === 'object' && !resources) {
      resources = gameId;
      gameId = this.getCurrentGameId();
    }

    if (!gameId) {
      return error('未设置当前游戏');
    }

    // 验证资源数据格式
    if (!resources || typeof resources !== 'object') {
      return error('资源数据格式错误');
    }

    return this.storageService.updateResources(gameId, resources);
  }

  /**
   * 获取当前游戏ID
   * @returns {string} 当前游戏ID
   */
  getCurrentGameId() {
    if (this.currentGameId) {
      return this.currentGameId;
    }

    // 从存储中加载
    const result = this.storageService.load();
    if (result.success && result.data.currentGameId) {
      this.currentGameId = result.data.currentGameId;
      return this.currentGameId;
    }

    // 返回默认游戏
    return 'genshin';
  }

  /**
   * 获取支持的游戏列表
   * @returns {Array} 游戏ID列表
   */
  getSupportedGames() {
    const configResult = this.configLoader.loadAllGames();
    if (configResult.success) {
      return Object.keys(configResult.data);
    }
    return ['genshin', 'starrail'];
  }

  /**
   * 获取游戏配置
   * @param {string} gameId - 游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  getGameConfig(gameId) {
    return this.configLoader.loadGameConfig(gameId);
  }

  /**
   * 检查游戏是否支持
   * @param {string} gameId - 游戏ID
   * @returns {boolean} 是否支持
   */
  isGameSupported(gameId) {
    const supportedGames = this.getSupportedGames();
    return supportedGames.includes(gameId);
  }
}

// 导出单例实例
const gameService = new GameService();
module.exports = gameService;