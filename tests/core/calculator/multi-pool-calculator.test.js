// tests/core/calculator/multi-pool-calculator.test.js
// 多池联动计算器单元测试

const MultiPoolCalculator = require('../../../core/calculator/multi-pool-calculator');
const onmyojiConfig = require('../../../config/games/onmyoji-multi-pool');

describe('MultiPoolCalculator - 多池联动计算器', () => {
  let calculator;
  const defaultPools = [
    { poolId: 'pool1', name: '卡池 A', upRate: 1.0 },
    { poolId: 'pool2', name: '卡池 B', upRate: 1.0 },
    { poolId: 'pool3', name: '卡池 C', upRate: 1.0 }
  ];

  beforeEach(() => {
    calculator = new MultiPoolCalculator({ pools: defaultPools, sharedPityCount: 0, gameConfig: onmyojiConfig });
    calculator.clearCache();
  });

  afterEach(() => {
    calculator.clearCache();
  });

  // ===== 核心功能测试 =====

  describe('calculateSinglePoolProbability - 单池概率计算', () => {
    test('基础概率应为 1%', () => {
      const probability = calculator.calculateSinglePoolProbability(0, 0);
      expect(probability).toBe(0.01);
    });

    test('399 抽时应返回 100% 概率', () => {
      const probability = calculator.calculateSinglePoolProbability(0, 399);
      expect(probability).toBe(1.0);
    });

    test('400 抽时应返回 100% 概率', () => {
      const probability = calculator.calculateSinglePoolProbability(0, 400);
      expect(probability).toBe(1.0);
    });

    test('无效卡池索引应返回 0', () => {
      const probability = calculator.calculateSinglePoolProbability(-1, 0);
      expect(probability).toBe(0);
    });

    test('UP 率影响概率计算', () => {
      const poolsWithUp = [
        { poolId: 'p1', name: 'UP 池', upRate: 0.5 },
        { poolId: 'p2', name: '普池', upRate: 1.0 }
      ];
      const calc = new MultiPoolCalculator({ pools: poolsWithUp, sharedPityCount: 0, gameConfig: onmyojiConfig });
      const probability = calc.calculateSinglePoolProbability(0, 0);
      expect(probability).toBeCloseTo(0.005, 3); // 0.01 * 0.5
    });
  });

  describe('calculateProbabilityDistribution - 概率分布计算', () => {
    test('应生成正确的概率分布', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 100 };

      const result = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].pull).toBe(1);
      expect(result[0].singleProbability).toBeDefined();
      expect(result[0].cumulativeProbability).toBeDefined();
    });

    test('第一抽概率应为基础概率', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 10 };

      const result = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      expect(result[0].singleProbability).toBeCloseTo(0.01, 3);
    });

    test('第 10 抽时保底计数应为 9', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 10 };

      const result = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      expect(result[9].pityCount).toBe(9);
    });

    test('初始保底计数 300 时第 1 抽保底计数应为 300', () => {
      const calc = new MultiPoolCalculator({ pools: defaultPools, sharedPityCount: 300, gameConfig: onmyojiConfig });
      const resources = { currentPity: 0 };
      const target = { pulls: 10 };

      const result = calc.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      expect(result[0].pityCount).toBe(300);
    });

    test('累积概率应随抽数递增', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 100 };

      const result = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].cumulativeProbability).toBeGreaterThanOrEqual(result[i - 1].cumulativeProbability);
      }
    });

    test('达到 400 抽时累积概率应接近 100%', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 400 };

      const result = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);

      const lastItem = result[result.length - 1];
      expect(lastItem.cumulativeProbability).toBeGreaterThanOrEqual(0.9999);
    });
  });

  describe('calculateExpectedValue - 期望值计算', () => {
    test('应返回合理的期望抽数', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 400 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);
      const expectedValue = calculator.calculateExpectedValue(distribution);

      expect(expectedValue).toBeGreaterThan(0);
      expect(expectedValue).toBeLessThan(400);
    });

    test('初始保底计数越高期望抽数应越低', () => {
      const target = { pulls: 400 };

      const calc1 = new MultiPoolCalculator({ pools: defaultPools, sharedPityCount: 0, gameConfig: onmyojiConfig });
      const dist1 = calc1.calculateProbabilityDistribution({ currentPity: 0 }, target, onmyojiConfig);
      const exp1 = calc1.calculateExpectedValue(dist1);

      const calc2 = new MultiPoolCalculator({ pools: defaultPools, sharedPityCount: 300, gameConfig: onmyojiConfig });
      const dist2 = calc2.calculateProbabilityDistribution({ currentPity: 0 }, target, onmyojiConfig);
      const exp2 = calc2.calculateExpectedValue(dist2);

      expect(exp2).toBeLessThan(exp1);
    });

    test('空分布应返回 0', () => {
      const expectedValue = calculator.calculateExpectedValue([]);
      expect(expectedValue).toBe(0);
    });
  });

  describe('calculateStatistics - 统计指标计算', () => {
    test('应返回完整的统计指标', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 400 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats).toHaveProperty('p50');
      expect(stats).toHaveProperty('p90');
      expect(stats).toHaveProperty('p95');
      expect(stats).toHaveProperty('p99');
      expect(stats).toHaveProperty('average');
      expect(stats).toHaveProperty('maxPulls');
    });

    test('P50 应小于 P90', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 400 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats.p50).toBeLessThan(stats.p90);
    });

    test('P90 应小于 P95', () => {
      const resources = { currentPity: 0 };
      const target = { pulls: 400 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, onmyojiConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats.p90).toBeLessThan(stats.p95);
    });
  });

  // ===== 最优策略测试 =====

  describe('findOptimalStrategy - 最优策略选择', () => {
    test('应返回推荐的卡池', () => {
      const poolResults = [
        { poolId: 'p1', poolName: '卡池 A', expectedValue: 50, p50: 45, p90: 80 },
        { poolId: 'p2', poolName: '卡池 B', expectedValue: 60, p50: 55, p90: 90 }
      ];

      const strategy = calculator.findOptimalStrategy(poolResults);

      expect(strategy.recommendedPool).toBeDefined();
      expect(strategy.recommendedPool.poolId).toBe('p1');
      expect(strategy.reason).toBeDefined();
      expect(strategy.ranking).toHaveLength(2);
      expect(strategy.ranking[0].rank).toBe(1);
    });

    test('空卡池列表应返回空结果', () => {
      const strategy = calculator.findOptimalStrategy([]);

      expect(strategy.recommendedPool).toBeNull();
      expect(strategy.reason).toContain('没有可用的卡池');
    });

    test('排名应按期望值排序', () => {
      const poolResults = [
        { poolId: 'p1', poolName: '卡池 A', expectedValue: 70, p50: 65 },
        { poolId: 'p2', poolName: '卡池 B', expectedValue: 50, p50: 45 },
        { poolId: 'p3', poolName: '卡池 C', expectedValue: 60, p50: 55 }
      ];

      const strategy = calculator.findOptimalStrategy(poolResults);

      expect(strategy.ranking[0].expectedValue).toBe(50);
      expect(strategy.ranking[1].expectedValue).toBe(60);
      expect(strategy.ranking[2].expectedValue).toBe(70);
    });
  });

  // ===== 完整 calculate 方法测试 =====

  describe('calculate - 完整计算', () => {
    test('应返回成功的 Result 格式', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('应返回 distribution, statistics, expectedValue', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.data).toHaveProperty('distribution');
      expect(result.data).toHaveProperty('statistics');
      expect(result.data).toHaveProperty('expectedValue');
    });

    test('应返回多池信息', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.data.multiPool).toBeDefined();
      expect(result.data.multiPool.poolCount).toBe(3);
      expect(result.data.multiPool.sharedPityCount).toBe(0);
      expect(result.data.multiPool.maxPity).toBe(400);
    });

    test('应返回最优策略', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.data.optimalStrategy).toBeDefined();
      expect(result.data.optimalStrategy.recommendedPool).toBeDefined();
      expect(result.data.optimalStrategy.ranking).toBeDefined();
    });

    test('参数为空应返回错误', () => {
      const result = calculator.calculate(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('资源数据为空应返回错误', () => {
      const params = {
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(false);
    });
  });

  // ===== 池管理测试 =====

  describe('池管理', () => {
    test('addPool 应添加卡池', () => {
      const initialCount = calculator.pools.length;
      calculator.addPool({ poolId: 'new', name: '新卡池', upRate: 1.0 });

      expect(calculator.pools.length).toBe(initialCount + 1);
    });

    test('removePool 应移除卡池', () => {
      calculator.addPool({ poolId: 'temp', name: '临时卡池', upRate: 1.0 });
      const initialCount = calculator.pools.length;

      calculator.removePool('temp');

      expect(calculator.pools.length).toBe(initialCount - 1);
    });

    test('updateSharedPityCount 应更新保底计数', () => {
      calculator.updateSharedPityCount(150);
      expect(calculator.sharedPityCount).toBe(150);
    });

    test('updateSharedPityCount 应限制在 0-400 范围', () => {
      calculator.updateSharedPityCount(-50);
      expect(calculator.sharedPityCount).toBe(0);

      calculator.updateSharedPityCount(500);
      expect(calculator.sharedPityCount).toBe(400);
    });
  });

  // ===== 缓存功能测试 =====

  describe('缓存功能', () => {
    test('相同参数应命中缓存', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result1 = calculator.calculate(params);
      const stats1 = calculator.getCacheStats();

      const result2 = calculator.calculate(params);
      const stats2 = calculator.getCacheStats();

      expect(JSON.stringify(result1)).toEqual(JSON.stringify(result2));
      expect(stats2.size).toBe(stats1.size);
    });

    test('clearCache 应清除所有缓存', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      calculator.calculate(params);
      expect(calculator.getCacheStats().size).toBeGreaterThan(0);

      calculator.clearCache();
      expect(calculator.getCacheStats().size).toBe(0);
    });
  });

  // ===== 边界条件测试 =====

  describe('边界条件', () => {
    test('保底计数 0 时应正常计算', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);
      expect(result.success).toBe(true);
    });

    test('保底计数 399 时第一抽应 100% 命中', () => {
      const calc = new MultiPoolCalculator({ pools: defaultPools, sharedPityCount: 399, gameConfig: onmyojiConfig });
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 1 },
        config: onmyojiConfig
      };

      const result = calc.calculate(params);
      expect(result.data.distribution[0].singleProbability).toBe(1.0);
      expect(result.data.distribution[0].cumulativeProbability).toBeCloseTo(1.0, 3);
    });

    test('抽数为 0 时应返回空分布', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 0 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);
      expect(result.data.distribution.length).toBe(0);
    });
  });
});
