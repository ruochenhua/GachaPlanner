// core/calculator/soft-pity.js
// 软保底策略计算器

const BaseCalculator = require('./base-calculator');

/**
 * 软保底策略计算器
 * 继承BaseCalculator，实现软保底逻辑
 */
class SoftPityCalculator extends BaseCalculator {
  /**
   * 计算单抽概率（软保底情况）
   * @param {number} pull - 当前抽数
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    const { softPityStart, softPityIncrement } = config;

    // 软保底区间：概率逐步提升
    if (pull >= softPityStart) {
      const increment = (pull - softPityStart + 1) * softPityIncrement;
      const probability = baseRate + increment;
      // 限制最大概率为1.0
      return Math.min(probability, 1.0);
    }

    // 保底前：基础概率
    return baseRate;
  }

  /**
   * 计算概率分布（软保底情况）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate, softPityStart, softPityIncrement } = config;
    const maxPulls = target.pulls || 100;
    const currentPity = target.currentPity || 0;

    console.log('软保底计算:', {
      baseRate,
      softPityStart,
      softPityIncrement,
      maxPulls,
      currentPity
    });

    const distribution = [];
    let cumulativeProbability = 0;

    for (let i = 1; i <= maxPulls; i++) {
      // 实际抽数（考虑继承）
      const actualPull = currentPity + i;

      // 单抽概率
      const singleProbability = this.calculateSingleProbability(actualPull, baseRate, config);

      // 累积概率计算（每一抽概率不同）
      cumulativeProbability = cumulativeProbability + (1 - cumulativeProbability) * singleProbability;

      distribution.push({
        pull: i,
        actualPull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * i,
        isSoftPity: actualPull >= softPityStart // 是否软保底区间
      });
    }

    console.log('软保底计算完成:', {
      pulls: distribution.length,
      lastPull: distribution[distribution.length - 1]
    });

    return distribution;
  }

  /**
   * 生成缓存键（包含软保底参数）
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

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
        pityType: config.pityType,
        softPityStart: config.softPityStart,
        softPityIncrement: config.softPityIncrement
      }
    });

    return key;
  }
}

module.exports = SoftPityCalculator;