/**
 * 规划数据持久化服务
 * 用于微信小程序 storage 存储规划数据
 */

const STORAGE_KEY_PREFIX = 'gacha_planning_';
const DATA_VERSION = '1.0.0';

/**
 * 默认规划数据结构
 */
function getDefaultData(gameId) {
  return {
    version: DATA_VERSION,
    resources: {
      primogems: 0,
      intertwinedFates: 0,
      acquaintFates: 0,
      currentPity: 0,
      guaranteeAvailable: false
    },
    totalPulls: 0,
    poolTimeRange: null,
    dailyIncome: {
      primogems: 0,
      commissions: false,
      events: 0
    },
    targets: [],
    metadata: {
      gameId,
      createdAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString()
    }
  };
}

/**
 * 规划数据存储类
 */
class PlanningStorage {
  /**
   * 生成存储键
   * @param {string} gameId - 游戏 ID
   * @returns {string} 存储键
   */
  static getStorageKey(gameId) {
    return `${STORAGE_KEY_PREFIX}${gameId}`;
  }

  /**
   * 保存规划数据
   * @param {string} gameId - 游戏 ID
   * @param {Object} data - 规划数据
   * @returns {Promise<Object>} 保存结果
   */
  static async savePlanningData(gameId, data) {
    const storageKey = this.getStorageKey(gameId);
    const dataToSave = {
      ...data,
      metadata: {
        ...(data.metadata || {}),
        gameId,
        lastSavedAt: new Date().toISOString()
      },
      version: DATA_VERSION
    };

    try {
      wx.setStorageSync(storageKey, JSON.stringify(dataToSave));
      console.log('规划数据保存成功:', gameId);
      return { success: true, data: dataToSave };
    } catch (error) {
      console.error('规划数据保存失败:', error);

      // 处理存储配额超限
      if (error.message && (error.message.includes('quota') ||
                             error.message.includes('exceeded') ||
                             error.message.includes('超出') ||
                             error.message.includes('空间不足'))) {
        return {
          success: false,
          error: '存储空间不足，请清理旧数据',
          code: 'STORAGE_QUOTA_EXCEEDED',
          data: null
        };
      }

      return {
        success: false,
        error: `保存失败：${error.message}`,
        data: null
      };
    }
  }

  /**
   * 加载规划数据
   * @param {string} gameId - 游戏 ID
   * @returns {Promise<Object>} 加载结果
   */
  static async loadPlanningData(gameId) {
    const storageKey = this.getStorageKey(gameId);

    try {
      const data = wx.getStorageSync(storageKey);

      if (!data) {
        return {
          success: true,
          data: getDefaultData(gameId),
          message: '未找到已保存的数据，已加载默认数据'
        };
      }

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      // 版本兼容性处理
      if (parsed.version !== DATA_VERSION) {
        console.log('检测到旧版本数据，进行迁移:', parsed.version);
        return this.migrateData(parsed, gameId);
      }

      return { success: true, data: parsed };
    } catch (error) {
      console.error('规划数据加载失败:', error);
      return {
        success: false,
        error: `加载失败：${error.message}`,
        data: getDefaultData(gameId)
      };
    }
  }

  /**
   * 删除规划数据
   * @param {string} gameId - 游戏 ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deletePlanningData(gameId) {
    const storageKey = this.getStorageKey(gameId);

    try {
      wx.removeStorageSync(storageKey);
      console.log('规划数据删除成功:', gameId);
      return { success: true };
    } catch (error) {
      console.error('规划数据删除失败:', error);
      return {
        success: false,
        error: `删除失败：${error.message}`
      };
    }
  }

  /**
   * 获取所有已保存的游戏 ID 列表
   * @returns {Array} 游戏 ID 列表
   */
  static async getAllGameIds() {
    try {
      const keys = wx.getStorageInfoSync().keys || [];
      const gameIds = keys
        .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
        .map(key => key.replace(STORAGE_KEY_PREFIX, ''));

      return { success: true, data: gameIds };
    } catch (error) {
      console.error('获取游戏列表失败:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * 获取所有规划数据概览
   * @returns {Promise<Object>} 概览数据
   */
  static async getAllPlanningData(options = {}) {
    const gameIdsResult = await this.getAllGameIds();
    if (!gameIdsResult.success) {
      return gameIdsResult;
    }

    const { batchSize = 10 } = options;
    const gameIds = gameIdsResult.data;
    const allData = [];

    // 分批加载，避免并发过高
    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(id => this.loadPlanningData(id)));

      for (const result of batchResults) {
        if (result.success) {
          const gameId = batch[batchResults.indexOf(result)];
          allData.push({
            gameId,
            data: result.data,
            lastSavedAt: result.data.metadata?.lastSavedAt
          });
        }
      }
    }

    return { success: true, data: allData };
  }

  /**
   * 清空所有规划数据
   * @returns {Promise<Object>} 清空结果
   */
  static async clearAllData() {
    const gameIdsResult = await this.getAllGameIds();
    if (!gameIdsResult.success) {
      return gameIdsResult;
    }

    const results = [];
    for (const gameId of gameIdsResult.data) {
      const result = await this.deletePlanningData(gameId);
      results.push({ gameId, success: result.success });
    }

    return {
      success: true,
      data: {
        clearedCount: results.filter(r => r.success).length,
        details: results
      }
    };
  }

  /**
   * 数据迁移（版本升级时使用）
   * @param {Object} oldData - 旧版本数据
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 迁移后的数据
   */
  static migrateData(oldData, gameId) {
    const oldVersion = oldData.version || '0.0.0';

    console.log('数据版本迁移:', oldVersion, '->', DATA_VERSION);

    // 从 0.x 或无版本 迁移到 1.0.0
    const migratedData = {
      version: DATA_VERSION,
      resources: {
        primogems: oldData.resources?.primogems || 0,
        intertwinedFates: oldData.resources?.intertwinedFates || 0,
        acquaintFates: oldData.resources?.acquaintFates || 0,
        currentPity: oldData.resources?.currentPity || 0,
        guaranteeAvailable: oldData.resources?.guaranteeAvailable || false
      },
      totalPulls: oldData.totalPulls || 0,
      poolTimeRange: oldData.poolTimeRange || null,
      dailyIncome: {
        primogems: oldData.dailyIncome?.primogems || 0,
        commissions: oldData.dailyIncome?.commissions || false,
        events: oldData.dailyIncome?.events || 0
      },
      targets: oldData.targets || [],
      metadata: {
        gameId,
        createdAt: oldData.metadata?.createdAt || new Date().toISOString(),
        lastSavedAt: new Date().toISOString()
      }
    };

    // 自动保存迁移后的数据
    this.savePlanningData(gameId, migratedData);

    return { success: true, data: migratedData };
  }

  /**
   * 验证规划数据格式
   * @param {Object} data - 待验证数据
   * @returns {Object} 验证结果
   */
  static validateData(data) {
    const errors = [];

    if (!data.resources) {
      errors.push('缺少 resources 字段');
    } else {
      if (typeof data.resources.primogems !== 'number') {
        errors.push('primogems 必须是数字');
      }
      if (typeof data.resources.currentPity !== 'number') {
        errors.push('currentPity 必须是数字');
      }
    }

    if (data.dailyIncome && typeof data.dailyIncome.primogems !== 'number') {
      errors.push('dailyIncome.primogems 必须是数字');
    }

    if (data.targets && !Array.isArray(data.targets)) {
      errors.push('targets 必须是数组');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = PlanningStorage;
