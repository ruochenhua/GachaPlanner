/**
 * 游戏管理服务
 * 提供游戏切换、资源获取和更新功能
 */

const { success, error } = require('../utils/result');
const storageService = require('./storage-service');
const configLoader = require('../config/config-loader');
const CalculatorFactory = require('../core/calculator/calculator-factory');
const PlanningStorage = require('./planning-storage');

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
   * 从 PlanningStorage 同步读取资源
   * @param {string} gameId - 游戏ID
   * @returns {Object|null} 资源对象，不存在时返回 null
   */
  _loadPlanningResources(gameId) {
    try {
      const key = PlanningStorage.getStorageKey(gameId);
      const raw = wx.getStorageSync(key);
      if (!raw) return null;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || !data.resources) return null;
      // 判断是否为全默认值（未设置过）
      const vals = Object.values(data.resources);
      const isDefault = vals.every(v => v === 0 || v === false || v === '');
      return isDefault ? null : data.resources;
    } catch (err) {
      return null;
    }
  }

  /**
   * 同步更新 PlanningStorage 中的资源
   * @param {string} gameId - 游戏ID
   * @param {Object} resources - 资源数据
   */
  _savePlanningResources(gameId, resources) {
    try {
      const key = PlanningStorage.getStorageKey(gameId);
      const raw = wx.getStorageSync(key);
      const data = raw
        ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
        : { version: '2.0.0', metadata: { gameId } };
      data.resources = { ...resources };
      data.metadata = { ...data.metadata, gameId, lastSavedAt: new Date().toISOString() };
      wx.setStorageSync(key, JSON.stringify(data));
    } catch (err) {
      // PlanningStorage 写入失败不影响主流程
    }
  }

  /**
   * 切换游戏
   * @param {string} gameId - 目标游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  switchGame(gameId) {

    // 1. 验证目标游戏存在
    if (!this.isGameSupported(gameId)) {
      return error(`不支持的游戏：${gameId}`);
    }

    // 2. 保存当前游戏数据（如有）
    if (this.currentGameId && this.currentGameId !== gameId) {
      const currentResources = this.storageService.loadCurrentGameResources(this.currentGameId);
      if (currentResources.success) {
        this.storageService.updateResources(this.currentGameId, currentResources.data);
      }
    }

    // 3. 更新currentGameId
    this.currentGameId = gameId;

    // 4. 加载新游戏资源数据（优先 PlanningStorage）
    const resourcesResult = this.getGameResources(gameId);
    if (!resourcesResult.success) {
      return resourcesResult;
    }

    // 5. 更新用户数据的currentGameId
    const userDataResult = this.storageService.load();
    if (userDataResult.success) {
      userDataResult.data.currentGameId = gameId;
      this.storageService.save(userDataResult.data);
    }

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

    // 优先从 PlanningStorage 读取（与 planning 页统一数据源）
    const planningResources = this._loadPlanningResources(gameId);
    if (planningResources) {
      return success(planningResources);
    }

    // 回退到旧存储
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

    // 同步到 PlanningStorage（统一数据源）
    this._savePlanningResources(gameId, resources);

    // 保持向后兼容：同时更新旧存储
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
   * 批量计算各游戏的达成概率
   * @param {Array} gamesData - 游戏数据数组 [{ gameId, resources, config }]
   * @returns {Object} Result对象 {success, data: {gameId: probability}}
   */
  batchCalculateProbabilities(gamesData) {
    if (!Array.isArray(gamesData)) {
      return error('参数必须是数组');
    }

    const result = {};
    for (const gameData of gamesData) {
      const { gameId, resources, config } = gameData;
      const probability = this._calculateGameProbability(resources, config);
      result[gameId] = probability;
    }

    return success(result);
  }

  /**
   * 计算单个游戏的达成概率（内部辅助）
   * @param {Object} resources - 资源数据
   * @param {Object} config - 游戏配置
   * @returns {number} 达成概率 (0-1)
   */
  _calculateGameProbability(resources, config) {
    if (!resources || !config) return 0;
    const conversionRate = config.conversionRate?.primaryToPull || 160;
    const resourceKeys = Object.keys(config.resources || {});
    if (resourceKeys.length === 0) return 0;
    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;
    const primaryValue = Number(resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;
    const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;
    if (totalPulls === 0) return 0;
    const target = { pulls: Math.min(totalPulls, config.hardPity || 90), currentPity: 0 };
    try {
      const calculator = CalculatorFactory.createCalculator(config);
      const calcResult = calculator.calculate({ resources, target, config });
      if (calcResult.success && calcResult.data && calcResult.data.length > 0) {
        return calcResult.data[calcResult.data.length - 1].cumulativeProbability;
      }
    } catch (err) {
      console.error('概率计算异常:', err);
    }
    return 0;
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