/**
 * 本地存储服务
 * 提供统一的数据持久化、版本迁移、智能缓存功能
 */

const { success, error } = require('../utils/result');

// 常量定义
const CURRENT_VERSION = '1.0.0';
const STORAGE_KEY = 'user_data';

/**
 * 存储服务类
 */
class StorageService {
  constructor() {
    // 智能缓存
    this.cache = {
      currentGame: null,      // 当前游戏数据（常驻内存）
      currentGameId: null,    // 当前游戏ID
      userData: null          // 完整用户数据
    };
  }

  /**
   * 加载用户数据
   * @returns {Object} Result对象 {success, data, error}
   */
  load() {
    try {
      const data = wx.getStorageSync(STORAGE_KEY);

      // 首次使用，返回默认数据
      if (!data) {
        const defaultData = this.getDefaultValue();
        this.cache.userData = defaultData;
        return success(defaultData);
      }

      // 版本迁移
      const migratedData = this.migrateData(data);

      // 更新缓存
      this.cache.userData = migratedData;

      return success(migratedData);
    } catch (err) {
      console.error('加载数据失败:', err);
      return error(`加载数据失败：${err.message}`);
    }
  }

  /**
   * 保存用户数据
   * @param {Object} data - 用户数据
   * @returns {Object} Result对象 {success, data, error}
   */
  save(data) {
    try {
      // 验证数据格式
      if (!data || typeof data !== 'object') {
        return error('数据格式错误：数据必须为对象');
      }

      if (!data.currentGameId || !data.games) {
        return error('数据格式错误：缺少必填字段');
      }

      // 更新版本号和时间戳
      data.version = CURRENT_VERSION;
      data.updatedAt = new Date().toISOString();

      // 更新缓存
      this.cache.userData = data;

      // 保存到存储
      wx.setStorageSync(STORAGE_KEY, data);

      return success(data);
    } catch (err) {
      console.error('保存数据失败:', err);
      return error(`保存数据失败：${err.message}`);
    }
  }

  /**
   * 版本迁移
   * @param {Object} data - 用户数据
   * @returns {Object} 迁移后的数据
   */
  migrateData(data) {
    const version = data.version || '0.0.0';

    // 0.x.x → 1.0.0 迁移
    if (version.startsWith('0.')) {
      data = this.migrate_0_to_1(data);
    }

    data.version = CURRENT_VERSION;
    return data;
  }

  /**
   * 从0.x.x迁移到1.0.0
   * @param {Object} data - 用户数据
   * @returns {Object} 迁移后的数据
   */
  migrate_0_to_1(data) {
    console.log('执行数据迁移: 0.x.x → 1.0.0');

    // 确保games字段存在
    if (!data.games) {
      data.games = {};
    }

    // 确保currentGameId存在
    if (!data.currentGameId) {
      data.currentGameId = 'genshin';
    }

    // 确保updatedAt存在
    if (!data.updatedAt) {
      data.updatedAt = new Date().toISOString();
    }

    return data;
  }

  /**
   * 加载当前游戏资源
   * @param {string} gameId - 游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  loadCurrentGameResources(gameId) {
    // 缓存命中
    if (this.cache.currentGameId === gameId && this.cache.currentGame) {
      console.log(`✓ 缓存命中: ${gameId}`);
      return success(this.cache.currentGame);
    }

    // 缓存未命中，读取存储
    console.log(`✗ 缓存未命中: ${gameId}，从存储读取`);
    const result = this.load();
    if (!result.success) {
      return result;
    }

    const userData = result.data;
    const gameData = userData.games[gameId] || this.getDefaultGameResources(gameId);

    // 更新缓存
    this.cache.currentGame = gameData;
    this.cache.currentGameId = gameId;

    return success(gameData);
  }

  /**
   * 更新游戏资源
   * @param {string} gameId - 游戏ID
   * @param {Object} resources - 资源数据
   * @returns {Object} Result对象 {success, data, error}
   */
  updateResources(gameId, resources) {
    // 更新缓存
    this.cache.currentGame = resources;
    this.cache.currentGameId = gameId;

    // 更新存储
    const result = this.load();
    if (!result.success) {
      return result;
    }

    const userData = result.data;
    userData.games[gameId] = resources;
    userData.updatedAt = new Date().toISOString();

    return this.save(userData);
  }

  /**
   * 清除所有数据（二次确认）
   * @returns {Promise} Promise包装的Result对象
   */
  clearAllData() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '确认清除',
        content: '将清除所有游戏数据、规划记录和历史记录，此操作不可恢复',
        success: (res) => {
          if (res.confirm) {
            wx.clearStorageSync();
            this.cache = { currentGame: null, currentGameId: null, userData: null };
            console.log('✓ 所有数据已清除');
            resolve(success(true));
          } else {
            console.log('✓ 取消清除操作');
            resolve(success(false));
          }
        }
      });
    });
  }

  /**
   * 获取默认数据结构
   * @returns {Object} 默认数据
   */
  getDefaultValue() {
    return {
      currentGameId: 'genshin',
      games: {},
      version: CURRENT_VERSION,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取默认游戏资源结构
   * @param {string} gameId - 游戏ID
   * @returns {Object} 默认游戏资源
   */
  getDefaultGameResources(gameId) {
    const defaultResources = {
      genshin: {
        primogems: 0,
        intertwinedFates: 0,
        currentPity: 0
      },
      starrail: {
        stellarJade: 0,
        starRailPasses: 0,
        currentPity: 0
      }
    };

    return defaultResources[gameId] || {};
  }

  /**
   * 加载用户自定义规则设置
   * @param {string} gameId - 游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  loadCustomRuleSettings(gameId) {
    if (!gameId) {
      return error('游戏ID不能为空');
    }

    const result = this.load();
    if (!result.success) {
      return result;
    }

    const userData = result.data;
    const customSettings = userData.customRuleSettings?.[gameId] || null;

    return success(customSettings);
  }

  /**
   * 保存用户自定义规则设置
   * @param {string} gameId - 游戏ID
   * @param {Object} settings - 规则设置
   * @returns {Object} Result对象 {success, data, error}
   */
  saveCustomRuleSettings(gameId, settings) {
    if (!gameId) {
      return error('游戏ID不能为空');
    }

    // 验证设置参数
    const validation = this.validateRuleSettings(settings);
    if (!validation.success) {
      return validation;
    }

    const result = this.load();
    if (!result.success) {
      return result;
    }

    const userData = result.data;

    // 初始化 customRuleSettings 结构
    if (!userData.customRuleSettings) {
      userData.customRuleSettings = {};
    }

    // 保存设置
    userData.customRuleSettings[gameId] = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    return this.save(userData);
  }

  /**
   * 清除用户自定义规则设置（重置为默认）
   * @param {string} gameId - 游戏ID
   * @returns {Object} Result对象 {success, data, error}
   */
  clearCustomRuleSettings(gameId) {
    if (!gameId) {
      return error('游戏ID不能为空');
    }

    const result = this.load();
    if (!result.success) {
      return result;
    }

    const userData = result.data;

    if (userData.customRuleSettings && userData.customRuleSettings[gameId]) {
      delete userData.customRuleSettings[gameId];
      return this.save(userData);
    }

    return success(true);
  }

  /**
   * 验证规则设置参数
   * @param {Object} settings - 规则设置
   * @returns {Object} Result对象 {success, data, error}
   */
  validateRuleSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return error('设置格式错误');
    }

    // 验证 baseRate (0.001 - 0.1)
    if (settings.baseRate !== undefined) {
      if (typeof settings.baseRate !== 'number' || settings.baseRate < 0.001 || settings.baseRate > 0.1) {
        return error('基础概率必须在 0.001 到 0.1 之间');
      }
    }

    // 验证 hardPity (1 - 200)
    if (settings.hardPity !== undefined) {
      if (typeof settings.hardPity !== 'number' || settings.hardPity < 1 || settings.hardPity > 200) {
        return error('硬保底阈值必须在 1 到 200 之间');
      }
    }

    // 验证 softPityStart (1 - hardPity)
    if (settings.softPityStart !== undefined) {
      if (typeof settings.softPityStart !== 'number' || settings.softPityStart < 1) {
        return error('软保底起始必须大于等于 1');
      }
      if (settings.hardPity && settings.softPityStart >= settings.hardPity) {
        return error('软保底起始必须小于硬保底阈值');
      }
    }

    // 验证 softPityIncrement (0.01 - 0.1)
    if (settings.softPityIncrement !== undefined) {
      if (typeof settings.softPityIncrement !== 'number' || settings.softPityIncrement < 0.01 || settings.softPityIncrement > 0.1) {
        return error('软保底提升率必须在 0.01 到 0.1 之间');
      }
    }

    return success(true);
  }

  /**
   * 验证游戏数据完整性
   * @param {Object} data - 游戏数据
   * @returns {Object} Result对象 {success, data, error}
   */
  validateGameData(data) {
    if (!data || typeof data !== 'object') {
      return error('数据格式错误：数据必须为对象');
    }

    if (!data.currentGameId) {
      return error('数据格式错误：缺少currentGameId字段');
    }

    if (!data.games || typeof data.games !== 'object') {
      return error('数据格式错误：缺少games字段或类型不正确');
    }

    return success(data);
  }
}

// 导出单例实例
const storageService = new StorageService();
module.exports = storageService;