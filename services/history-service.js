/**
 * 历史记录服务
 * 提供抽卡历史记录的存储、查询、更新、删除功能
 */

const { success, error } = require('../utils/result');
const accuracyCalculator = require('../core/analytics/accuracy-calculator');

// 常量定义
const HISTORY_STORAGE_KEY = 'gacha_history';
const DELETED_STORAGE_KEY = 'gacha_history_deleted'; // 软删除记录暂存

/**
 * 历史记录服务类
 */
class HistoryService {
  constructor() {
    // 缓存历史记录
    this.cache = {
      history: null,
      deleted: null
    };
  }

  /**
   * 生成唯一记录ID
   * @returns {string} 记录ID
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `record_${timestamp}_${random}`;
  }

  /**
   * 保存历史记录
   * @param {Object} record 记录数据
   * @returns {Object} Result对象 {success, data, error}
   */
  saveRecord(record) {
    try {
      // 验证记录数据
      const validation = this.validateRecord(record);
      if (!validation.success) {
        return validation;
      }

      // 加载现有历史
      const historyResult = this.loadHistoryRaw();
      const history = historyResult.success ? historyResult.data : [];

      // 创建完整记录
      const fullRecord = {
        id: this.generateId(),
        gameId: record.gameId,
        gameName: record.gameName || '',
        poolName: record.poolName || '',
        target: record.target || '',
        predictedProbability: record.predictedProbability,
        actualResult: record.actualResult || 'pending',
        pullsUsed: record.pullsUsed || 0,
        resourcesUsed: record.resourcesUsed || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false
      };

      // 添加到历史列表
      history.unshift(fullRecord); // 新记录在最前面

      // 保存到存储
      wx.setStorageSync(HISTORY_STORAGE_KEY, history);

      // 更新缓存
      this.cache.history = history;

      console.log(`✓ 历史记录已保存: ${fullRecord.id}`);
      return success(fullRecord);
    } catch (err) {
      console.error('保存历史记录失败:', err);
      return error(`保存历史记录失败：${err.message}`);
    }
  }

  /**
   * 加载历史记录列表（原始数据）
   * @returns {Object} Result对象 {success, data, error}
   */
  loadHistoryRaw() {
    try {
      // 缓存命中
      if (this.cache.history !== null) {
        return success(this.cache.history);
      }

      const data = wx.getStorageSync(HISTORY_STORAGE_KEY);
      const history = data || [];

      // 更新缓存
      this.cache.history = history;

      return success(history);
    } catch (err) {
      console.error('加载历史记录失败:', err);
      return error(`加载历史记录失败：${err.message}`);
    }
  }

  /**
   * 加载历史记录列表（查询接口）
   * @param {Object} options 查询选项
   * @param {string} options.gameId 游戏ID筛选
   * @param {number} options.limit 分页限制
   * @param {number} options.offset 分页偏移
   * @param {boolean} options.includeDeleted 是否包含已删除记录
   * @returns {Object} Result对象 {success, data, error}
   */
  loadHistory(options = {}) {
    try {
      const startTime = Date.now();

      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      let history = result.data;

      // 过滤软删除记录
      if (!options.includeDeleted) {
        history = history.filter(r => !r.isDeleted);
      }

      // 按游戏筛选
      if (options.gameId) {
        history = history.filter(r => r.gameId === options.gameId);
      }

      // 按时间倒序排列（已在存储时保证）
      history.sort((a, b) => b.createdAt - a.createdAt);

      // 分页处理
      const offset = options.offset || 0;
      const limit = options.limit || history.length;
      const paginatedHistory = history.slice(offset, offset + limit);

      const queryTime = Date.now() - startTime;
      console.log(`✓ 加载历史记录完成，耗时: ${queryTime}ms`);

      // 性能检查
      if (queryTime > 100) {
        console.warn(`⚠ 查询耗时 ${queryTime}ms > 100ms`);
      }

      return success({
        records: paginatedHistory,
        total: history.length,
        offset: offset,
        limit: limit,
        queryTime: queryTime
      });
    } catch (err) {
      console.error('查询历史记录失败:', err);
      return error(`查询历史记录失败：${err.message}`);
    }
  }

  /**
   * 根据ID获取单条记录
   * @param {string} id 记录ID
   * @returns {Object} Result对象 {success, data, error}
   */
  getRecordById(id) {
    const result = this.loadHistoryRaw();
    if (!result.success) {
      return result;
    }

    const record = result.data.find(r => r.id === id);
    if (!record) {
      return error(`记录不存在: ${id}`);
    }

    return success(record);
  }

  /**
   * 更新历史记录
   * @param {string} id 记录ID
   * @param {Object} updates 更新内容
   * @returns {Object} Result对象 {success, data, error}
   */
  updateRecord(id, updates) {
    try {
      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      const history = result.data;
      const index = history.findIndex(r => r.id === id);

      if (index === -1) {
        return error(`记录不存在: ${id}`);
      }

      // 验证更新内容
      if (updates.predictedProbability !== undefined) {
        if (updates.predictedProbability < 0 || updates.predictedProbability > 100) {
          return error('预测概率必须在0-100之间');
        }
      }

      if (updates.actualResult !== undefined) {
        if (!['success', 'failure', 'pending'].includes(updates.actualResult)) {
          return error('实际结果必须是 success/failure/pending');
        }
      }

      // 更新记录
      const updatedRecord = {
        ...history[index],
        ...updates,
        updatedAt: Date.now()
      };

      history[index] = updatedRecord;

      // 保存到存储
      wx.setStorageSync(HISTORY_STORAGE_KEY, history);

      // 更新缓存
      this.cache.history = history;

      console.log(`✓ 历史记录已更新: ${id}`);
      return success(updatedRecord);
    } catch (err) {
      console.error('更新历史记录失败:', err);
      return error(`更新历史记录失败：${err.message}`);
    }
  }

  /**
   * 删除历史记录
   * @param {string} id 记录ID
   * @param {boolean} soft 是否软删除（默认true）
   * @returns {Object} Result对象 {success, data, error}
   */
  deleteRecord(id, soft = true) {
    try {
      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      const history = result.data;
      const index = history.findIndex(r => r.id === id);

      if (index === -1) {
        return error(`记录不存在: ${id}`);
      }

      const record = history[index];

      if (soft) {
        // 软删除：标记为已删除
        record.isDeleted = true;
        record.deletedAt = Date.now();
        history[index] = record;

        // 保存软删除记录到暂存区（用于恢复）
        this.addToDeletedBuffer(record);

        wx.setStorageSync(HISTORY_STORAGE_KEY, history);
        this.cache.history = history;

        console.log(`✓ 历史记录已软删除: ${id}`);
        return success({ deleted: true, soft: true, record: record });
      } else {
        // 硬删除：直接移除
        history.splice(index, 1);

        wx.setStorageSync(HISTORY_STORAGE_KEY, history);
        this.cache.history = history;

        console.log(`✓ 历史记录已硬删除: ${id}`);
        return success({ deleted: true, soft: false });
      }
    } catch (err) {
      console.error('删除历史记录失败:', err);
      return error(`删除历史记录失败：${err.message}`);
    }
  }

  /**
   * 恢复已删除记录
   * @param {string} id 记录ID
   * @returns {Object} Result对象 {success, data, error}
   */
  restoreRecord(id) {
    try {
      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      const history = result.data;
      const index = history.findIndex(r => r.id === id);

      if (index === -1) {
        return error(`记录不存在: ${id}`);
      }

      const record = history[index];
      if (!record.isDeleted) {
        return error('记录未被删除，无需恢复');
      }

      // 检查是否在30秒内可恢复
      const deletedTime = record.deletedAt || 0;
      const elapsed = Date.now() - deletedTime;
      if (elapsed > 30000) {
        return error('超过30秒恢复时间限制');
      }

      // 恢复记录
      record.isDeleted = false;
      delete record.deletedAt;
      record.updatedAt = Date.now();
      history[index] = record;

      // 从删除暂存区移除
      this.removeFromDeletedBuffer(id);

      wx.setStorageSync(HISTORY_STORAGE_KEY, history);
      this.cache.history = history;

      console.log(`✓ 历史记录已恢复: ${id}`);
      return success(record);
    } catch (err) {
      console.error('恢复历史记录失败:', err);
      return error(`恢复历史记录失败：${err.message}`);
    }
  }

  /**
   * 添加到删除暂存区
   * @param {Object} record 记录数据
   */
  addToDeletedBuffer(record) {
    try {
      const deletedBuffer = wx.getStorageSync(DELETED_STORAGE_KEY) || [];
      deletedBuffer.unshift({
        ...record,
        bufferAddedAt: Date.now()
      });

      // 只保留最近50条删除记录
      if (deletedBuffer.length > 50) {
        deletedBuffer.pop();
      }

      wx.setStorageSync(DELETED_STORAGE_KEY, deletedBuffer);
      this.cache.deleted = deletedBuffer;
    } catch (err) {
      console.error('添加到删除暂存区失败:', err);
    }
  }

  /**
   * 从删除暂存区移除
   * @param {string} id 记录ID
   */
  removeFromDeletedBuffer(id) {
    try {
      const deletedBuffer = wx.getStorageSync(DELETED_STORAGE_KEY) || [];
      const index = deletedBuffer.findIndex(r => r.id === id);

      if (index !== -1) {
        deletedBuffer.splice(index, 1);
        wx.setStorageSync(DELETED_STORAGE_KEY, deletedBuffer);
        this.cache.deleted = deletedBuffer;
      }
    } catch (err) {
      console.error('从删除暂存区移除失败:', err);
    }
  }

  /**
   * 验证记录数据完整性
   * @param {Object} record 记录数据
   * @returns {Object} Result对象 {success, data, error}
   */
  validateRecord(record) {
    if (!record || typeof record !== 'object') {
      return error('记录格式错误：记录必须为对象');
    }

    // 必填字段验证
    if (!record.gameId) {
      return error('记录格式错误：缺少gameId字段');
    }

    // 概率值验证
    if (record.predictedProbability !== undefined) {
      if (typeof record.predictedProbability !== 'number') {
        return error('预测概率必须为数字');
      }
      if (record.predictedProbability < 0 || record.predictedProbability > 100) {
        return error('预测概率必须在0-100之间');
      }
    }

    // 实际结果验证
    if (record.actualResult !== undefined) {
      if (!['success', 'failure', 'pending'].includes(record.actualResult)) {
        return error('实际结果必须是 success/failure/pending');
      }
    }

    return success(record);
  }

  /**
   * 获取统计数据
   * @param {string} gameId 游戏ID（可选）
   * @returns {Object} Result对象 {success, data, error}
   */
  getStats(gameId) {
    try {
      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      let history = result.data.filter(r => !r.isDeleted);

      // 按游戏筛选
      if (gameId) {
        history = history.filter(r => r.gameId === gameId);
      }

      // 计算统计数据
      const total = history.length;
      const successes = history.filter(r => r.actualResult === 'success').length;
      const failures = history.filter(r => r.actualResult === 'failure').length;
      const pending = history.filter(r => r.actualResult === 'pending').length;

      const hitRate = total > 0 ? Math.round((successes / total) * 100) : 0;

      // 按游戏分组统计
      const gameStats = {};
      history.forEach(record => {
        if (!gameStats[record.gameId]) {
          gameStats[record.gameId] = {
            gameId: record.gameId,
            gameName: record.gameName,
            total: 0,
            successes: 0,
            failures: 0,
            hitRate: 0
          };
        }
        gameStats[record.gameId].total++;
        if (record.actualResult === 'success') {
          gameStats[record.gameId].successes++;
        }
        if (record.actualResult === 'failure') {
          gameStats[record.gameId].failures++;
        }
      });

      // 计算每个游戏的命中率
      Object.keys(gameStats).forEach(gId => {
        const stats = gameStats[gId];
        stats.hitRate = stats.total > 0 ? Math.round((stats.successes / stats.total) * 100) : 0;
      });

      const stats = {
        total,
        successes,
        failures,
        pending,
        hitRate,
        gameStats
      };

      return success(stats);
    } catch (err) {
      console.error('获取统计数据失败:', err);
      return error(`获取统计数据失败：${err.message}`);
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.history = null;
    this.cache.deleted = null;
    console.log('✓ 历史记录缓存已清除');
  }

  /**
   * 获取准确度统计
   * @param {string} gameId 游戏ID（可选）
   * @returns {Object} Result对象 {success, data, error}
   */
  getAccuracy(gameId) {
    try {
      const result = this.loadHistoryRaw();
      if (!result.success) {
        return result;
      }

      let history = result.data.filter(r => !r.isDeleted);

      // 按游戏筛选
      if (gameId) {
        history = history.filter(r => r.gameId === gameId);
      }

      // 使用准确度计算器计算完整统计
      const accuracy = accuracyCalculator.calculateOverallAccuracy(history);

      return success(accuracy);
    } catch (err) {
      console.error('获取准确度统计失败:', err);
      return error(`获取准确度统计失败：${err.message}`);
    }
  }
}

// 导出单例实例
const historyService = new HistoryService();
module.exports = historyService;