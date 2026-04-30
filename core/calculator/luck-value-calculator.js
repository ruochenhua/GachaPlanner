// core/calculator/luck-value-calculator.js
// 幸运值计算器 - 王者荣耀专用

const BaseCalculator = require('./base-calculator');
const { success, error } = require('../../utils/result');
const { LUCK_VALUE, PROBABILITY_THRESHOLD } = require('../constants');

/**
 * 幸运值计算器
 * 用于计算王者荣耀等游戏的幸运值累积机制
 *
 * 核心机制：
 * - 基础概率：0.5% (0.005)
 * - 幸运值范围：0-360
 * - 每抽失败 +1 幸运值
 * - 每点幸运值增加 0.2% 概率 (0.002)
 * - 361 抽必中 (幸运值满时概率 100%)
 */
class LuckValueCalculator extends BaseCalculator {
  /**
   * 计算单抽概率（考虑幸运值）
   * @param {number} pull - 当前抽数（从 1 开始）
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @param {number} currentLuck - 当前幸运值
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config, currentLuck = 0) {
    const { luckValue } = config;

    if (!luckValue || !luckValue.enabled) {
      // 无幸运值机制，返回基础概率
      return baseRate;
    }

    const { maxValue = LUCK_VALUE.DEFAULT_MAX, ratePerLuck = LUCK_VALUE.DEFAULT_RATE_PER_LUCK, guaranteeAtMax = true } = luckValue;

    // 检查是否达到满幸运值（361 抽必中）
    if (guaranteeAtMax && currentLuck >= maxValue - 1) {
      return 1.0;
    }

    // 计算幸运值加成后的概率
    // 公式：实际概率 = baseRate + (currentLuck * ratePerLuck)
    const boostedRate = baseRate + (currentLuck * ratePerLuck);

    // 概率上限为 100%
    return Math.min(boostedRate, 1.0);
  }

  /**
   * 计算概率分布（考虑幸运值累积）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate, luckValue } = config;
    const { currentLuck = 0 } = resources;
    const { pulls: maxPulls = 100 } = target;
    const { maxValue = LUCK_VALUE.DEFAULT_MAX } = luckValue || {};

    const distribution = [];
    let cumulativeProbability = 0;

    for (let pull = 1; pull <= maxPulls; pull++) {
      // 当前幸运值 = 初始幸运值 + (已抽次数 - 1)
      // 因为第一抽时还没有累积幸运值
      const currentLuckValue = Math.max(0, Math.min(currentLuck + (pull - 1), maxValue - 1));

      // 计算单抽概率
      const singleProbability = this.calculateSingleProbability(
        pull,
        baseRate,
        config,
        currentLuckValue
      );

      // 累积概率计算
      // P(前 n 抽内至少中一次) = 1 - P(前 n 抽都没中)
      const failProbability = 1 - singleProbability;
      const cumulativeFail = pull === 1
        ? (1 - singleProbability)
        : (1 - distribution[pull - 2].cumulativeProbability) * failProbability;

      cumulativeProbability = 1 - cumulativeFail;

      distribution.push({
        pull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * pull,
        luckValue: currentLuckValue
      });

      // 如果已经达到 100% 概率，后续抽数无需计算
      if (cumulativeProbability >= PROBABILITY_THRESHOLD) {
        break;
      }
    }

    return distribution;
  }

  /**
   * 计算期望值（平均需要多少抽）
   * @param {Array} distribution - 概率分布
   * @returns {number} 期望抽数
   */
  calculateExpectedValue(distribution) {
    if (!distribution || distribution.length === 0) {
      return 0;
    }

    let expectedValue = 0;
    let previousCumulative = 0;

    for (const item of distribution) {
      // 当前抽数命中的概率 = 当前累积概率 - 上次累积概率
      const probabilityAtPull = item.cumulativeProbability - previousCumulative;
      expectedValue += item.pull * probabilityAtPull;
      previousCumulative = item.cumulativeProbability;
    }

    return expectedValue;
  }

  /**
   * 计算统计指标
   * @param {Array} distribution - 概率分布
   * @returns {Object} 统计指标对象
   */
  calculateStatistics(distribution) {
    if (!distribution || distribution.length === 0) {
      return {
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        average: 0,
        maxPulls: 0
      };
    }

    // P50: 50% 概率命中的抽数
    const p50 = distribution.find(d => d.cumulativeProbability >= 0.5)?.pull || 0;

    // P90: 90% 概率命中的抽数
    const p90 = distribution.find(d => d.cumulativeProbability >= 0.9)?.pull || 0;

    // P95: 95% 概率命中的抽数
    const p95 = distribution.find(d => d.cumulativeProbability >= 0.95)?.pull || 0;

    // P99: 99% 概率命中的抽数
    const p99 = distribution.find(d => d.cumulativeProbability >= 0.99)?.pull || 0;

    // 最大抽数
    const maxPulls = distribution[distribution.length - 1]?.pull || 0;

    return {
      p50,
      p90,
      p95,
      p99,
      average: this.calculateExpectedValue(distribution),
      maxPulls
    };
  }

  /**
   * 重写 calculate 方法，添加幸运值专用结果
   * @param {Object} params - 计算参数
   * @returns {Object} Result 对象
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
        console.log('幸运值计算器缓存命中:', cacheKey);
        return success(this.cache.get(cacheKey));
      }

      // 计算概率分布
      const distribution = this.calculateProbabilityDistribution(
        resources,
        target,
        config
      );

      // 计算统计指标
      const statistics = this.calculateStatistics(distribution);

      // 计算期望值
      const expectedValue = this.calculateExpectedValue(distribution);

      // 构建完整结果
      const result = {
        distribution,
        statistics,
        expectedValue,
        luckValue: {
          initial: resources.currentLuck || 0,
          max: config.luckValue?.maxValue || 361,
          description: '每抽失败 +1 幸运值，361 抽必中'
        }
      };

      // 缓存结果
      this.cache.set(cacheKey, result);

      console.log('幸运值计算完成:', {
        cacheKey,
        expectedPulls: expectedValue.toFixed(2),
        p50: statistics.p50,
        p90: statistics.p90
      });

      return success(result);
    } catch (err) {
      console.error('幸运值计算失败:', err);
      return error(`计算失败：${err.message}`);
    }
  }

  /**
   * 重写参数验证，添加幸运值特定验证
   * @param {Object} params - 计算参数
   * @returns {Object} 验证结果
   */
  validateParams(params) {
    // 先调用父类验证
    const parentValidation = super.validateParams(params);
    if (!parentValidation.valid) {
      return parentValidation;
    }

    const { config, resources } = params;
    const { luckValue } = config;

    if (luckValue && luckValue.enabled) {
      // 验证幸运值配置
      if (luckValue.maxValue <= 0) {
        return { valid: false, message: '幸运值最大值必须大于 0' };
      }

      // 验证当前幸运值
      const currentLuck = resources.currentLuck || 0;
      if (currentLuck < 0) {
        return { valid: false, message: '幸运值不能为负数' };
      }

      if (currentLuck >= luckValue.maxValue) {
        console.warn('警告：当前幸运值已达到或超过最大值');
      }
    }

    return { valid: true };
  }

  /**
   * 重写缓存键生成，包含幸运值
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

    const key = JSON.stringify({
      resources: {
        primogems: resources.primogems || 0,
        intertwinedFates: resources.intertwinedFates || 0,
        currentLuck: resources.currentLuck || 0
      },
      target: {
        pulls: target.pulls || 0,
        currentPity: target.currentPity || 0
      },
      config: {
        gameId: config.gameId,
        baseRate: config.baseRate,
        pityType: config.pityType,
        luckValue: config.luckValue?.enabled || false
      }
    });

    return `luck:${key}`;
  }
}

module.exports = LuckValueCalculator;
