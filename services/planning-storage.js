/**
 * 规划数据持久化服务
 * 用于微信小程序 storage 存储规划数据
 */

const STORAGE_KEY_PREFIX = 'gacha_planning_';
const DATA_VERSION = '2.0.0';

/**
 * 默认目标数据结构
 */
function getDefaultTarget() {
  return {
    id: '',
    type: 'character',      // character | weapon | other
    name: '',
    rarity: 5,              // 4 或 5 星
    constellations: 0,      // 期望命座/精炼等级
    isGuaranteed: false,    // 是否大保底
    poolStartDate: '',      // 卡池开始日期 ISO 格式
    poolEndDate: '',        // 卡池结束日期 ISO 格式
    isActive: true          // 是否激活
  };
}

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


    let migratedData = { ...oldData };

    // 0.x → 2.0.0：完整迁移
    if (oldVersion.startsWith('0.') || oldVersion === '0.0.0') {
      migratedData = {
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
        targets: [],
        metadata: {
          gameId,
          createdAt: oldData.metadata?.createdAt || new Date().toISOString(),
          lastSavedAt: new Date().toISOString()
        }
      };
    }

    // 1.0.0 → 2.0.0：补充 target 字段默认值
    if (oldVersion === '1.0.0') {
      migratedData.version = DATA_VERSION;
      migratedData.targets = (oldData.targets || []).map(target => ({
        ...getDefaultTarget(),
        ...target
      }));
    }

    // 确保 metadata 存在
    if (!migratedData.metadata) {
      migratedData.metadata = {
        gameId,
        createdAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString()
      };
    }
    migratedData.metadata.lastSavedAt = new Date().toISOString();

    // 自动保存迁移后的数据
    this.savePlanningData(gameId, migratedData);

    return { success: true, data: migratedData };
  }

  /**
   * 验证规划数据格式
   * @param {Object} data - 待验证数据
   * @returns {Object} 验证结果
   */
  /**
   * 保存目标
   * @param {string} gameId - 游戏 ID
   * @param {Object} target - 目标数据
   * @returns {Promise<Object>} 保存结果
   */
  static async saveTarget(gameId, target) {
    const loadResult = await this.loadPlanningData(gameId);
    if (!loadResult.success) {
      return loadResult;
    }

    const data = loadResult.data;
    const targets = data.targets || [];

    // 生成 id（新目标）
    if (!target.id) {
      target.id = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 合并默认值
    const mergedTarget = {
      ...getDefaultTarget(),
      ...target
    };

    // 如果已存在同 id 目标则替换，否则追加
    const existingIndex = targets.findIndex(t => t.id === mergedTarget.id);
    if (existingIndex >= 0) {
      targets[existingIndex] = mergedTarget;
    } else {
      targets.push(mergedTarget);
    }

    data.targets = targets;
    data.version = DATA_VERSION;

    return this.savePlanningData(gameId, data);
  }

  /**
   * 更新目标
   * @param {string} gameId - 游戏 ID
   * @param {string} targetId - 目标 ID
   * @param {Object} target - 目标数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateTarget(gameId, targetId, target) {
    const loadResult = await this.loadPlanningData(gameId);
    if (!loadResult.success) {
      return loadResult;
    }

    const data = loadResult.data;
    const targets = data.targets || [];
    const index = targets.findIndex(t => t.id === targetId);

    if (index < 0) {
      return { success: false, error: '目标不存在', data: null };
    }

    targets[index] = {
      ...targets[index],
      ...target,
      id: targetId // 确保 id 不被覆盖
    };

    data.targets = targets;
    return this.savePlanningData(gameId, data);
  }

  /**
   * 删除目标
   * @param {string} gameId - 游戏 ID
   * @param {string} targetId - 目标 ID
   * @returns {Promise<Object>} 删除结果
   */
  static async removeTarget(gameId, targetId) {
    const loadResult = await this.loadPlanningData(gameId);
    if (!loadResult.success) {
      return loadResult;
    }

    const data = loadResult.data;
    const targets = data.targets || [];
    const newTargets = targets.filter(t => t.id !== targetId);

    if (newTargets.length === targets.length) {
      return { success: false, error: '目标不存在', data: null };
    }

    data.targets = newTargets;
    return this.savePlanningData(gameId, data);
  }

  /**
   * 获取目标列表
   * @param {string} gameId - 游戏 ID
   * @returns {Promise<Object>} 目标列表
   */
  static async getTargets(gameId) {
    const loadResult = await this.loadPlanningData(gameId);
    if (!loadResult.success) {
      return loadResult;
    }

    return {
      success: true,
      data: loadResult.data.targets || []
    };
  }

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
