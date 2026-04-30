// tests/integration/luck-value-integration.test.js
// 幸运值计算器集成测试

const CalculatorFactory = require('../../core/calculator/calculator-factory');
const hokLuckConfig = require('../../config/games/hok-luck');

describe('LuckValueCalculator - 集成测试', () => {
  describe('工厂集成', () => {
    test('工厂应能创建幸运值计算器', () => {
      const calculator = CalculatorFactory.createCalculator(hokLuckConfig);

      expect(calculator).toBeDefined();
      expect(calculator.constructor.name).toBe('LuckValueCalculator');
    });

    test('工厂创建的计算器应能正常计算', () => {
      const calculator = CalculatorFactory.createCalculator(hokLuckConfig);

      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
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
      calculator = CalculatorFactory.createCalculator(hokLuckConfig);
    });

    test('完整流程：从 0 幸运值开始计算', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 361 * 60 }, // 361 抽所需的积分
        target: { pulls: 361 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);

      // 验证结果完整性
      expect(result.data.distribution.length).toBeGreaterThan(0);
      expect(result.data.statistics.p50).toBeGreaterThan(0);
      expect(result.data.statistics.p90).toBeGreaterThan(result.data.statistics.p50);
      expect(result.data.statistics.p99).toBeGreaterThan(result.data.statistics.p90);

      // 361 抽必中
      const lastPull = result.data.distribution[result.data.distribution.length - 1];
      expect(lastPull.cumulativeProbability).toBeGreaterThanOrEqual(0.9999);
    });

    test('完整流程：高幸运值开局', () => {
      const params = {
        resources: { currentLuck: 300, tokens: 61 * 60 }, // 61 抽所需的积分
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);

      // 期望值应远低于从 0 开始
      expect(result.data.expectedValue).toBeLessThan(180);
    });

    test('完整流程：资源转换计算', () => {
      // 模拟用户有 10000 积分，需要计算能抽多少次
      const tokens = 10000;
      const conversionRate = hokLuckConfig.conversionRate.primaryToPull; // 60
      const maxPulls = Math.floor(tokens / conversionRate);

      const params = {
        resources: { currentLuck: 50, tokens },
        target: { pulls: maxPulls },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);
      // 由于达到 99.99% 概率后会提前停止计算，distribution.length 可能小于 maxPulls
      expect(result.data.distribution.length).toBeGreaterThan(0);
      expect(result.data.distribution.length).toBeLessThanOrEqual(maxPulls);

      // 计算累积概率
      const finalProbability = result.data.distribution[result.data.distribution.length - 1].cumulativeProbability;
      expect(finalProbability).toBeGreaterThan(0);
      expect(finalProbability).toBeLessThanOrEqual(1.0);
    });
  });

  describe('统计指标验证', () => {
    let calculator;

    beforeEach(() => {
      calculator = CalculatorFactory.createCalculator(hokLuckConfig);
    });

    test('统计指标应符合概率论规律', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 361 },
        config: hokLuckConfig
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
      const calculator = CalculatorFactory.createCalculator(hokLuckConfig);

      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
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
      calculator = CalculatorFactory.createCalculator(hokLuckConfig);
    });

    test('无效参数应返回错误', () => {
      const result = calculator.calculate(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('缺少 config 应返回错误', () => {
      const params = {
        resources: { currentLuck: 0 },
        target: { pulls: 100 }
      };

      const result = calculator.calculate(params);
      expect(result.success).toBe(false);
    });

    test('幸运值为负数应返回错误或警告', () => {
      const params = {
        resources: { currentLuck: -100, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);
      // 应该失败或给出警告
      expect(result.success).toBe(false);
    });
  });
});
