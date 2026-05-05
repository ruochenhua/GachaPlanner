// core/calculator/hard-pity.js
// 硬保底策略计算器

const BaseCalculator = require('./base-calculator');

/**
 * 硬保底策略计算器
 * 继承BaseCalculator，实现硬保底逻辑
 */
class HardPityCalculator extends BaseCalculator {
  /**
   * 计算单抽概率（硬保底情况）
   * @param {number} pull - 当前抽数（相对于保底开始）
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    const hardPity = config.hardPity?.count || 90;

    // 硬保底抽：必定触发
    if (pull >= hardPity) {
      return 1.0;
    }

    // 保底前：基础概率
    return baseRate;
  }

  /**
   * 计算概率分布（硬保底情况）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const baseRate = config.baseRate;
    const hardPity = config.hardPity?.count || 90;
    const maxPulls = target.pulls || hardPity; // 默认计算到保底
    const currentPity = target.currentPity || 0; // 继承抽数

    console.log('硬保底计算:', {
      baseRate,
      hardPity,
      maxPulls,
      currentPity
    });

    const distribution = [];

    for (let i = 1; i <= maxPulls; i++) {
      // 实际抽数（考虑继承）
      const actualPull = currentPity + i;

      // 单抽概率
      const singleProbability = this.calculateSingleProbability(actualPull, baseRate, config);

      // 累积概率计算（考虑保底）
      let cumulativeProbability;

      if (actualPull >= hardPity) {
        // 保底抽：必定触发
        cumulativeProbability = 1.0;
      } else {
        // 保底前：1 - (1-p)^n
        cumulativeProbability = 1 - Math.pow(1 - baseRate, actualPull);
      }

      distribution.push({
        pull: i,
        actualPull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * i,
        isPityPull: actualPull >= hardPity // 是否保底抽
      });
    }

    console.log('硬保底计算完成:', {
      pulls: distribution.length,
      lastPull: distribution[distribution.length - 1]
    });

    return distribution;
  }

  /**
   * 生成缓存键（包含保底参数）
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
        hardPity: config.hardPity?.count
      }
    });

    return key;
  }
}

module.exports = HardPityCalculator;