// core/calculator/base-calculator.js
// 基础概率计算器

const { success, error } = require('../../utils/result');

/**
 * 基础计算器类
 * 纯函数实现，无副作用
 */
class BaseCalculator {
  constructor() {
    // 计算结果缓存
    this.cache = new Map();
  }

  /**
   * 计算概率分布
   * @param {Object} params - 计算参数
   * @param {Object} params.resources - 资源数据 {primogems, intertwinedFates, ...}
   * @param {Object} params.target - 目标数据 {pulls, currentPity}
   * @param {Object} params.config - 游戏配置 {baseRate, pityType, ...}
   * @returns {Object} Result对象 {success, data, error}
   */
  calculate(params) {
    try {
      // 参数验证
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return error(validation.message);
      }

      const { resources, target, config } = params;

      // 生成缓存键
      const cacheKey = this.generateCacheKey(params);

      // 检查缓存
      if (this.cache.has(cacheKey)) {
        console.log('缓存命中:', cacheKey);
        return success(this.cache.get(cacheKey));
      }

      // 计算概率分布
      const distribution = this.calculateProbabilityDistribution(
        resources,
        target,
        config
      );

      // 缓存结果
      this.cache.set(cacheKey, distribution);

      console.log('计算完成:', {
        cacheKey,
        pulls: distribution.length,
        finalProbability: distribution[distribution.length - 1].cumulativeProbability
      });

      return success(distribution);
    } catch (err) {
      console.error('计算失败:', err);
      return error(`计算失败：${err.message}`);
    }
  }

  /**
   * 计算概率分布（无保底情况）
   * 子类可重写此方法实现保底逻辑
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate } = config;
    const maxPulls = target.pulls || 100; // 默认计算100抽

    const distribution = [];

    for (let pull = 1; pull <= maxPulls; pull++) {
      // 单抽概率（无保底情况，固定为基础概率）
      const singleProbability = this.calculateSingleProbability(pull, baseRate, config);

      // 累积概率（1 - (1-p)^n）
      const cumulativeProbability = 1 - Math.pow(1 - baseRate, pull);

      distribution.push({
        pull,
        singleProbability,
        cumulativeProbability,
        // 期望值（累积概率 * 抽数）
        expectedValue: cumulativeProbability * pull
      });
    }

    return distribution;
  }

  /**
   * 计算单抽概率（无保底情况）
   * 子类可重写此方法实现保底逻辑
   * @param {number} pull - 当前抽数
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    // 无保底情况，每抽概率固定为基础概率
    return baseRate;
  }

  /**
   * 验证计算参数
   * @param {Object} params - 计算参数
   * @returns {Object} 验证结果 {valid, message}
   */
  validateParams(params) {
    if (!params) {
      return { valid: false, message: '参数不能为空' };
    }

    const { resources, target, config } = params;

    if (!resources) {
      return { valid: false, message: '资源数据不能为空' };
    }

    if (!target) {
      return { valid: false, message: '目标数据不能为空' };
    }

    if (!config) {
      return { valid: false, message: '游戏配置不能为空' };
    }

    if (!config.baseRate || config.baseRate <= 0 || config.baseRate >= 1) {
      return { valid: false, message: '基础概率必须在0-1之间' };
    }

    return { valid: true };
  }

  /**
   * 生成缓存键
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

    // 基于关键参数生成唯一键
    const key = JSON.stringify({
      resources: {
        primogems: resources.primogems || 0,
        intertwinedFates: resources.intertwinedFates || 0
      },
      target: {
        pulls: target.pulls || 0,
        currentPity: target.currentPity || 0
      },
      config: {
        gameId: config.gameId,
        baseRate: config.baseRate,
        pityType: config.pityType
      }
    });

    return key;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    console.log('缓存已清除');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = BaseCalculator;