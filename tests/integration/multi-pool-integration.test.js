// tests/integration/multi-pool-integration.test.js
// 多池联动计算器集成测试

const CalculatorFactory = require('../../core/calculator/calculator-factory');
const onmyojiConfig = require('../../config/games/onmyoji');

describe('MultiPoolCalculator - 集成测试', () => {
  describe('工厂集成', () => {
    test('工厂应能创建多池计算器', () => {
      const calculator = CalculatorFactory.createCalculator(onmyojiConfig);

      expect(calculator).toBeDefined();
      expect(calculator.constructor.name).toBe('MultiPoolCalculator');
    });

    test('工厂创建的计算器应能正常计算', () => {
      const calculator = CalculatorFactory.createCalculator(onmyojiConfig);

      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);
      expect(result.data.distribution).toBeDefined();
      expect(result.data.statistics).toBeDefined();
    });
  });

  describe('完整计算流程', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(onmyojiConfig);
    });

    test('完整流程：从 0 保底计数开始计算', () => {
      const params = {
        resources: { currentPity: 0, charm: 400 * 100 }, // 400 抽所需的勾玉
        target: { pulls: 400 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);

      // 验证结果完整性
      expect(result.data.distribution.length).toBeGreaterThan(0);
      expect(result.data.statistics.p50).toBeGreaterThan(0);
      expect(result.data.statistics.p90).toBeGreaterThan(result.data.statistics.p50);
      expect(result.data.statistics.p99).toBeGreaterThan(result.data.statistics.p90);

      // 400 抽必中
      const lastPull = result.data.distribution[result.data.distribution.length - 1];
      expect(lastPull.cumulativeProbability).toBeGreaterThanOrEqual(0.9999);
    });

    test('完整流程：高保底计数开局', () => {
      const MultiPoolCalculator = require('../../core/calculator/multi-pool-calculator');
      const calc = new MultiPoolCalculator({
        pools: [{ poolId: 'p1', name: '卡池 A', upRate: 1.0 }],
        sharedPityCount: 350,
        gameConfig: onmyojiConfig
      });

      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calc.calculate(params);

      expect(result.success).toBe(true);

      // 期望值应远低于从 0 开始
      expect(result.data.expectedValue).toBeLessThan(50);
    });

    test('完整流程：资源转换计算', () => {
      // 模拟用户有 20000 勾玉，需要计算能抽多少次
      const charm = 20000;
      const conversionRate = onmyojiConfig.conversionRate.primaryToPull; // 100
      const maxPulls = Math.floor(charm / conversionRate);

      const params = {
        resources: { currentPity: 50, charm },
        target: { pulls: maxPulls },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);
      expect(result.data.distribution.length).toBeGreaterThan(0);
      expect(result.data.distribution.length).toBeLessThanOrEqual(maxPulls);

      // 计算累积概率
      const finalProbability = result.data.distribution[result.data.distribution.length - 1].cumulativeProbability;
      expect(finalProbability).toBeGreaterThan(0);
      expect(finalProbability).toBeLessThanOrEqual(1.0);
    });
  });

  describe('多池管理', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(onmyojiConfig);
    });

    test('应能添加卡池', () => {
      const initialCount = calculator.pools.length;

      calculator.addPool({ poolId: 'new', name: '新卡池', upRate: 1.0 });

      expect(calculator.pools.length).toBe(initialCount + 1);
    });

    test('应能移除卡池', () => {
      calculator.addPool({ poolId: 'temp', name: '临时卡池', upRate: 1.0 });
      const initialCount = calculator.pools.length;

      calculator.removePool('temp');

      expect(calculator.pools.length).toBe(initialCount - 1);
    });

    test('应能更新共享保底计数', () => {
      calculator.updateSharedPityCount(200);
      expect(calculator.sharedPityCount).toBe(200);
    });
  });

  describe('最优策略推荐', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(onmyojiConfig);
    });

    test('应返回最优策略推荐', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      expect(result.data.optimalStrategy).toBeDefined();
      expect(result.data.optimalStrategy.recommendedPool).toBeDefined();
      expect(result.data.optimalStrategy.reason).toBeDefined();
      expect(result.data.optimalStrategy.ranking).toBeDefined();
      expect(result.data.optimalStrategy.ranking.length).toBeGreaterThan(0);
    });

    test('推荐应基于期望值', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);

      // 排名第一的应是期望值最低的
      const ranking = result.data.optimalStrategy.ranking;
      for (let i = 1; i < ranking.length; i++) {
        expect(ranking[i - 1].expectedValue).toBeLessThanOrEqual(ranking[i].expectedValue);
      }
    });
  });

  describe('统计指标验证', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(onmyojiConfig);
    });

    test('统计指标应符合概率论规律', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 400 },
        config: onmyojiConfig
      };

      const result = calculator.calculate(params);
      const stats = result.data.statistics;

      // P50 < P90 < P95 < P99
      expect(stats.p50).toBeLessThan(stats.p90);
      expect(stats.p90).toBeLessThan(stats.p95);
      expect(stats.p95).toBeLessThan(stats.p99);

      // 平均值应在 P50 和 P90 之间
      expect(stats.average).toBeGreaterThan(stats.p50);
      expect(stats.average).toBeLessThan(stats.p90);
    });
  });

  describe('缓存机制验证', () => {
    test('多次相同计算应命中缓存', () => {
      const calculator = CalculatorFactory.createCalculator(onmyojiConfig);

      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 },
        config: onmyojiConfig
      };

      // 第一次计算
      const result1 = calculator.calculate(params);
      const cacheStats1 = calculator.getCacheStats();

      // 第二次计算（应命中缓存）
      const result2 = calculator.calculate(params);
      const cacheStats2 = calculator.getCacheStats();

      // 结果应相同
      expect(JSON.stringify(result1)).toEqual(JSON.stringify(result2));
      // 缓存大小应不变
      expect(cacheStats2.size).toBe(cacheStats1.size);
    });
  });

  describe('错误处理', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(onmyojiConfig);
    });

    test('无效参数应返回错误', () => {
      const result = calculator.calculate(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('缺少 config 应返回错误', () => {
      const params = {
        resources: { currentPity: 0 },
        target: { pulls: 100 }
      };

      const result = calculator.calculate(params);
      expect(result.success).toBe(false);
    });
  });
});
