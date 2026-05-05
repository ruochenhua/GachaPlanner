/**
 * 大小保底计算器
 * 处理UP角色概率机制（原神、崩铁等）
 *
 * 核心机制：
 * - 小保底：获得5星时，有50%概率是UP角色
 * - 大保底：如果上次5星歪了，下次5星必定是UP
 */

const BaseCalculator = require('./base-calculator');

/**
 * 大小保底计算器
 * 使用状态机方法计算获得UP角色的概率
 */
class GuaranteeCalculator extends BaseCalculator {
  /**
   * 计算概率分布（考虑大小保底）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const baseRate = config.baseRate || 0.006;
    const hardPity = config.hardPity?.count || config.hardPity || 90;
    const softPityStart = config.softPity?.start || config.softPityStart || 74;
    const softPityIncrement = config.softPity?.increment || config.softPityIncrement || 0.06;
    const guaranteeRate = config.guarantee?.rate || config.guaranteeRate || 0.5;

    const maxPulls = target.pulls || hardPity;
    const currentPity = target.currentPity || 0;
    const isGuaranteed = target.isGuaranteed || false;

    console.log('大小保底计算:', {
      baseRate,
      hardPity,
      softPityStart,
      guaranteeRate,
      maxPulls,
      currentPity,
      isGuaranteed
    });

    // 使用状态机计算
    // 状态：[小保底状态概率, 大保底状态概率, 已获得UP概率]
    // 初始状态：如果isGuaranteed则从大保底开始，否则从小保底开始

    let state = isGuaranteed ? [0, 1, 0] : [1, 0, 0];
    const distribution = [];

    for (let i = 1; i <= maxPulls; i++) {
      const actualPull = currentPity + i;

      // 计算这一抽获得5星的概率（软保底）
      const fiveStarRate = this.calculateFiveStarRate(
        actualPull,
        baseRate,
        hardPity,
        softPityStart,
        softPityIncrement
      );

      // 状态转移
      state = this.transitionState(state, fiveStarRate, guaranteeRate);

      distribution.push({
        pull: i,
        actualPull,
        fiveStarRate,
        cumulativeProbability: state[2], // 已获得UP的概率
        isPityPull: actualPull >= hardPity
      });
    }

    console.log('大小保底计算完成:', {
      pulls: distribution.length,
      finalProbability: Math.round(distribution[distribution.length - 1].cumulativeProbability * 100) + '%'
    });

    return distribution;
  }

  /**
   * 计算获得5星的概率（软保底）
   * @param {number} pull - 抽数
   * @param {number} baseRate - 基础概率
   * @param {number} hardPity - 硬保底
   * @param {number} softPityStart - 软保底开始
   * @param {number} softPityIncrement - 软保底增量
   * @returns {number} 5星概率
   */
  calculateFiveStarRate(pull, baseRate, hardPity, softPityStart, softPityIncrement) {
    if (pull >= hardPity) {
      return 1.0;
    }

    if (pull >= softPityStart) {
      const softRate = baseRate + (pull - softPityStart + 1) * softPityIncrement;
      return Math.min(softRate, 1.0);
    }

    return baseRate;
  }

  /**
   * 状态转移
   *
   * 状态定义：
   * - state[0]: 处于小保底状态的概率（下一个5星有50%是UP）
   * - state[1]: 处于大保底状态的概率（下一个5星必定是UP）
   * - state[2]: 已获得UP角色的概率
   *
   * 转移规则（每抽）：
   * - 小保底状态：
   *   - 获得5星且是UP → 已获得UP
   *   - 获得5星且歪了 → 大保底状态
   *   - 没获得5星 → 保持小保底
   * - 大保底状态：
   *   - 获得5星（必定UP）→ 已获得UP
   *   - 没获得5星 → 保持大保底
   *
   * @param {Array} state - 当前状态 [小保底, 大保底, 已获得UP]
   * @param {number} fiveStarRate - 这一抽获得5星的概率
   * @param {number} guaranteeRate - 小保底UP概率
   * @returns {Array} 新状态
   */
  transitionState(state, fiveStarRate, guaranteeRate) {
    const [smallPity, bigPity, hasUP] = state;

    const noFiveStarRate = 1 - fiveStarRate;

    // 小保底状态的转移
    const smallToUP = smallPity * fiveStarRate * guaranteeRate; // 小保底 → 获得UP
    const smallToBig = smallPity * fiveStarRate * (1 - guaranteeRate); // 小保底 → 大保底（歪了）
    const smallStay = smallPity * noFiveStarRate; // 小保底 → 保持小保底

    // 大保底状态的转移
    const bigToUP = bigPity * fiveStarRate; // 大保底 → 获得UP（必定是UP）
    const bigStay = bigPity * noFiveStarRate; // 大保底 → 保持大保底

    // 新状态
    const newSmallPity = smallStay;
    const newBigPity = smallToBig + bigStay;
    const newHasUP = hasUP + smallToUP + bigToUP;

    return [newSmallPity, newBigPity, newHasUP];
  }

  /**
   * 生成缓存键
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

    const key = JSON.stringify({
      resources: {
        primogems: resources.primogemes || 0,
        intertwinedFates: resources.intertwinedFates || 0,
        stellarJade: resources.stellarJade || 0,
        starRailPasses: resources.starRailPasses || 0
      },
      target: {
        pulls: target.pulls || 0,
        currentPity: target.currentPity || 0,
        isGuaranteed: target.isGuaranteed || false
      },
      config: {
        gameId: config.gameId,
        baseRate: config.baseRate,
        hardPity: config.hardPity?.count || config.hardPity,
        guaranteeRate: config.guarantee?.rate || config.guaranteeRate
      }
    });

    return key;
  }
}

module.exports = GuaranteeCalculator;