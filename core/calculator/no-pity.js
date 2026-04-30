/**
 * 无保底策略计算器
 * 用于无保底机制的游戏（如FGO、碧蓝航线等）
 * 每抽概率固定为基础概率
 */

const BaseCalculator = require('./base-calculator');
const { success, error } = require('../../utils/result');

/**
 * 无保底计算器类
 */
class NoPityCalculator extends BaseCalculator {
  /**
   * 计算概率分布（无保底）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const baseRate = config.baseRate;
    const maxPulls = target.pulls || 100;

    const distribution = [];

    for (let pull = 1; pull <= maxPulls; pull++) {
      // 无保底：每抽概率固定为基础概率
      const singleProbability = baseRate;

      // 累积概率：P(n) = 1 - (1 - p)^n
      const cumulativeProbability = 1 - Math.pow(1 - baseRate, pull);

      distribution.push({
        pull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * pull
      });
    }

    return distribution;
  }

  /**
   * 计算单抽概率（无保底）
   * @param {number} pull - 当前抽数
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    // 无保底：每抽概率固定
    return baseRate;
  }

  /**
   * 计算达到目标概率所需抽数
   * @param {number} targetProbability - 目标概率（0-100）
   * @param {Object} config - 游戏配置
   * @returns {number} 所需抽数
   */
  calculatePullsForProbability(targetProbability, config) {
    const baseRate = config.baseRate;
    const targetRate = targetProbability / 100;

    // P(n) = 1 - (1 - p)^n
    // n = log(1 - targetRate) / log(1 - p)
    if (targetRate >= 1) {
      return Infinity; // 100%概率需要无限抽
    }

    const pulls = Math.log(1 - targetRate) / Math.log(1 - baseRate);
    return Math.ceil(pulls);
  }

  /**
   * 计算期望抽数
   * @param {Object} config - 游戏配置
   * @returns {number} 期望抽数
   */
  calculateExpectedPulls(config) {
    // 无保底情况，期望抽数 = 1 / p
    return 1 / config.baseRate;
  }

  /**
   * 获取策略描述
   * @returns {string} 策略描述
   */
  getStrategyDescription() {
    return '无保底策略：每抽概率固定为基础概率，无保底触发机制';
  }
}

module.exports = NoPityCalculator;