// core/calculator/multi-pool-calculator.js
// 多池联动计算器 - 阴阳师等游戏专用

const BaseCalculator = require('./base-calculator');
const { success, error } = require('../../utils/result');
const { MULTI_POOL, PROBABILITY_THRESHOLD } = require('../constants');

/**
 * 多池联动计算器
 * 用于计算阴阳师等多池共享保底计数的游戏
 *
 * 核心机制：
 * - 多个卡池共享同一个保底计数
 * - 每次抽取任意卡池都会增加共享计数
 * - 400 抽必中 SP/SSR
 * - 需要计算最优策略（抽哪个池）
 */
class MultiPoolCalculator extends BaseCalculator {
  /**
   * 构造函数
   * @param {Object} config - 配置对象 { pools, sharedPityCount, gameConfig }
   */
  constructor(config) {
    super();
    this.pools = config?.pools || [];
    this.sharedPityCount = config?.sharedPityCount || 0;
    this.gameConfig = config?.gameConfig || {};
  }

  /**
   * 计算单池概率（考虑共享保底）
   * @param {number} poolIndex - 卡池索引
   * @param {number} pityCount - 当前保底计数
   * @returns {number} 单抽概率
   */
  calculateSinglePoolProbability(poolIndex, pityCount) {
    if (poolIndex < 0 || poolIndex >= this.pools.length) {
      return 0;
    }

    const pool = this.pools[poolIndex];
    const { baseRate } = this.gameConfig;
    const { upRate = 1.0 } = pool;

    // 399 抽时下一抽必中 (pityCount 从 0 开始，399 表示已经是第 399 抽，下一抽是第 400 抽)
    if (pityCount >= 399) {
      return 1.0;
    }

    // 基础概率 * UP 率
    return baseRate * upRate;
  }

  /**
   * 计算概率分布（多池联动）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate } = this.gameConfig;
    const { currentPity = 0 } = resources;
    const { pulls: maxPulls = 100 } = target;

    const distribution = [];
    let cumulativeProbability = 0;

    // 使用共享保底计数
    const pityCount = this.sharedPityCount;

    for (let pull = 1; pull <= maxPulls; pull++) {
      // 当前保底计数 = 初始计数 + (已抽次数 - 1)
      const currentPityValue = Math.min(pityCount + (pull - 1), MULTI_POOL.DEFAULT_MAX_PITY - 1);

      // 计算单抽概率（考虑 400 抽必中）
      let singleProbability;
      if (currentPityValue >= MULTI_POOL.DEFAULT_MAX_PITY - 1) {
        singleProbability = 1.0;
      } else {
        // 综合概率 = baseRate * 平均 UP 率
        const avgUpRate = this.pools.length > 0
          ? this.pools.reduce((sum, p) => sum + (p.upRate || 1.0), 0) / this.pools.length
          : 1.0;
        singleProbability = baseRate * avgUpRate;
      }

      // 累积概率计算
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
        pityCount: currentPityValue
      });

      // 如果已经达到 100% 概率，后续抽数无需计算
      if (cumulativeProbability >= PROBABILITY_THRESHOLD) {
        break;
      }
    }

    return distribution;
  }

  /**
   * 计算各池的期望值
   * @param {Array} poolResults - 各池计算结果
   * @returns {Array} 期望值数组
   */
  calculateExpectedValues(poolResults) {
    return poolResults.map(result => ({
      poolId: result.poolId,
      poolName: result.poolName,
      expectedValue: result.expectedValue,
      p50: result.p50,
      p90: result.p90
    }));
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

    const p50 = distribution.find(d => d.cumulativeProbability >= 0.5)?.pull || 0;
    const p90 = distribution.find(d => d.cumulativeProbability >= 0.9)?.pull || 0;
    const p95 = distribution.find(d => d.cumulativeProbability >= 0.95)?.pull || 0;
    const p99 = distribution.find(d => d.cumulativeProbability >= 0.99)?.pull || 0;
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
   * 计算期望值
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
      const probabilityAtPull = item.cumulativeProbability - previousCumulative;
      expectedValue += item.pull * probabilityAtPull;
      previousCumulative = item.cumulativeProbability;
    }

    return expectedValue;
  }

  /**
   * 计算综合概率（多池合并）
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Object} 综合概率结果
   */
  calculateCombinedProbability(resources, target, config) {
    const poolResults = [];

    // 分别计算每个池的结果
    for (let i = 0; i < this.pools.length; i++) {
      const pool = this.pools[i];
      const distribution = this.calculateProbabilityDistribution(resources, target, config);
      const statistics = this.calculateStatistics(distribution);
      const expectedValue = this.calculateExpectedValue(distribution);

      poolResults.push({
        poolId: pool.poolId,
        poolName: pool.name,
        distribution,
        statistics,
        expectedValue,
        upRate: pool.upRate || 1.0
      });
    }

    // 找出最优策略
    const optimalStrategy = this.findOptimalStrategy(poolResults);

    return {
      poolResults,
      optimalStrategy,
      combinedStatistics: this.calculateStatistics(
        this.calculateProbabilityDistribution(resources, target, config)
      )
    };
  }

  /**
   * 找出最优策略（推荐抽哪个池）
   * @param {Array} poolResults - 各池计算结果
   * @returns {Object} 最优策略
   */
  findOptimalStrategy(poolResults) {
    if (poolResults.length === 0) {
      return {
        recommendedPool: null,
        reason: '没有可用的卡池',
        ranking: []
      };
    }

    // 按期望值排序（期望值越小越好）
    const sorted = [...poolResults].sort((a, b) => a.expectedValue - b.expectedValue);
    const best = sorted[0];

    // 生成推荐理由
    let reason = '';
    if (best.expectedValue < 50) {
      reason = `期望值最低（${best.expectedValue.toFixed(1)}抽），推荐抽取`;
    } else if (best.p50 < 60) {
      reason = `P50 最低（${best.p50}抽），较易达成`;
    } else {
      reason = `综合期望最优（${best.expectedValue.toFixed(1)}抽）`;
    }

    return {
      recommendedPool: {
        poolId: best.poolId,
        poolName: best.poolName,
        expectedValue: best.expectedValue,
        p50: best.p50,
        p90: best.p90
      },
      reason,
      ranking: sorted.map((r, index) => ({
        rank: index + 1,
        poolId: r.poolId,
        poolName: r.poolName,
        expectedValue: r.expectedValue,
        p50: r.p50
      }))
    };
  }

  /**
   * 添加卡池
   * @param {Object} pool - 卡池配置
   */
  addPool(pool) {
    this.pools.push(pool);
    console.log('添加卡池:', pool);
  }

  /**
   * 移除卡池
   * @param {string} poolId - 卡池 ID
   */
  removePool(poolId) {
    const index = this.pools.findIndex(p => p.poolId === poolId);
    if (index !== -1) {
      this.pools.splice(index, 1);
      console.log('移除卡池:', poolId);
    }
  }

  /**
   * 更新共享保底计数
   * @param {number} count - 新的保底计数
   */
  updateSharedPityCount(count) {
    this.sharedPityCount = Math.max(0, Math.min(count, MULTI_POOL.DEFAULT_MAX_PITY));
    console.log('更新共享保底计数:', this.sharedPityCount);
  }

  /**
   * 重写 calculate 方法，添加多池专用结果
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
        console.log('多池计算器缓存命中:', cacheKey);
        return success(this.cache.get(cacheKey));
      }

      // 计算综合概率
      const combinedResult = this.calculateCombinedProbability(resources, target, config);

      // 计算基础分布
      const distribution = this.calculateProbabilityDistribution(resources, target, config);
      const statistics = this.calculateStatistics(distribution);
      const expectedValue = this.calculateExpectedValue(distribution);

      // 构建完整结果
      const result = {
        distribution,
        statistics,
        expectedValue,
        poolResults: combinedResult.poolResults,
        optimalStrategy: combinedResult.optimalStrategy,
        multiPool: {
          poolCount: this.pools.length,
          sharedPityCount: this.sharedPityCount,
          maxPity: MULTI_POOL.DEFAULT_MAX_PITY,
          description: `${MULTI_POOL.DEFAULT_MAX_PITY} 抽必中，多池共享保底计数`
        }
      };

      // 缓存结果
      this.cache.set(cacheKey, result);

      console.log('多池计算完成:', {
        cacheKey,
        expectedPulls: expectedValue.toFixed(2),
        recommendedPool: combinedResult.optimalStrategy.recommendedPool?.poolName
      });

      return success(result);
    } catch (err) {
      console.error('多池计算失败:', err);
      return error(`计算失败：${err.message}`);
    }
  }

  /**
   * 重写参数验证，添加多池特定验证
   * @param {Object} params - 计算参数
   * @returns {Object} 验证结果
   */
  validateParams(params) {
    // 先调用父类验证
    const parentValidation = super.validateParams(params);
    if (!parentValidation.valid) {
      return parentValidation;
    }

    const { config } = params;

    // 验证多池配置
    if (config.multiPool && config.multiPool.enabled) {
      if (!config.multiPool.pools || config.multiPool.pools.length === 0) {
        return { valid: false, message: '多池模式必须至少有一个卡池' };
      }
    }

    return { valid: true };
  }

  /**
   * 重写缓存键生成，包含多池信息
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

    const key = JSON.stringify({
      resources: {
        primogems: resources.primogems || 0,
        currentPity: resources.currentPity || 0,
        sharedPityCount: this.sharedPityCount
      },
      target: {
        pulls: target.pulls || 0
      },
      config: {
        gameId: config.gameId,
        baseRate: config.baseRate,
        pityType: config.pityType,
        multiPool: config.multiPool?.enabled || false,
        poolCount: this.pools.length
      }
    });

    return `multi-pool:${key}`;
  }
}

module.exports = MultiPoolCalculator;
