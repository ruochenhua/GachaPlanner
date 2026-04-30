// tests/core/calculator/luck-value-calculator.test.js
// 幸运值计算器单元测试

const LuckValueCalculator = require('../../../core/calculator/luck-value-calculator');
const hokLuckConfig = require('../../../config/games/hok-luck');

describe('LuckValueCalculator - 幸运值计算器', () => {
  let calculator;

  beforeEach(() => {
    calculator = new LuckValueCalculator();
    calculator.clearCache();
  });

  afterEach(() => {
    calculator.clearCache();
  });

  // ===== 核心功能测试 =====

  describe('calculateSingleProbability - 单抽概率计算', () => {
    test('基础概率应为 0.5%', () => {
      const probability = calculator.calculateSingleProbability(1, 0.005, hokLuckConfig, 0);
      expect(probability).toBe(0.005);
    });

    test('幸运值 100 时应增加概率', () => {
      // 公式：0.005 + (100 * 0.002) = 0.205
      const probability = calculator.calculateSingleProbability(1, 0.005, hokLuckConfig, 100);
      expect(probability).toBeCloseTo(0.205, 3);
    });

    test('幸运值 360 时应为 100% 概率', () => {
      const probability = calculator.calculateSingleProbability(1, 0.005, hokLuckConfig, 360);
      expect(probability).toBe(1.0);
    });

    test('幸运值 200 时应为 40.5% 概率', () => {
      // 公式：0.005 + (200 * 0.002) = 0.405
      const probability = calculator.calculateSingleProbability(1, 0.005, hokLuckConfig, 200);
      expect(probability).toBeCloseTo(0.405, 3);
    });

    test('无幸运值配置时应返回基础概率', () => {
      const configWithoutLuck = { ...hokLuckConfig, luckValue: { enabled: false } };
      const probability = calculator.calculateSingleProbability(1, 0.005, configWithoutLuck, 100);
      expect(probability).toBe(0.005);
    });
  });

  describe('calculateProbabilityDistribution - 概率分布计算', () => {
    test('应生成正确的概率分布', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 100 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].pull).toBe(1);
      expect(result[0].singleProbability).toBeDefined();
      expect(result[0].cumulativeProbability).toBeDefined();
    });

    test('第一抽概率应为基础概率 0.5%', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 10 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      expect(result[0].singleProbability).toBeCloseTo(0.005, 3);
    });

    test('第 10 抽时幸运值应为 9', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 10 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      expect(result[9].luckValue).toBe(9);
    });

    test('初始幸运值 50 时第 1 抽幸运值应为 50', () => {
      const resources = { currentLuck: 50, tokens: 0 };
      const target = { pulls: 10 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      expect(result[0].luckValue).toBe(50);
    });

    test('累积概率应随抽数递增', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 100 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].cumulativeProbability).toBeGreaterThanOrEqual(result[i - 1].cumulativeProbability);
      }
    });

    test('达到 361 抽时累积概率应接近 100%', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const result = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);

      const lastItem = result[result.length - 1];
      expect(lastItem.cumulativeProbability).toBeGreaterThanOrEqual(0.9999);
    });
  });

  describe('calculateExpectedValue - 期望值计算', () => {
    test('应返回合理的期望抽数', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);
      const expectedValue = calculator.calculateExpectedValue(distribution);

      expect(expectedValue).toBeGreaterThan(0);
      expect(expectedValue).toBeLessThan(361);
    });

    test('初始幸运值越高期望抽数应越低', () => {
      const target = { pulls: 361 };

      const dist1 = calculator.calculateProbabilityDistribution({ currentLuck: 0 }, target, hokLuckConfig);
      const exp1 = calculator.calculateExpectedValue(dist1);

      const dist2 = calculator.calculateProbabilityDistribution({ currentLuck: 100 }, target, hokLuckConfig);
      const exp2 = calculator.calculateExpectedValue(dist2);

      expect(exp2).toBeLessThan(exp1);
    });

    test('空分布应返回 0', () => {
      const expectedValue = calculator.calculateExpectedValue([]);
      expect(expectedValue).toBe(0);
    });
  });

  describe('calculateStatistics - 统计指标计算', () => {
    test('应返回完整的统计指标', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats).toHaveProperty('p50');
      expect(stats).toHaveProperty('p90');
      expect(stats).toHaveProperty('p95');
      expect(stats).toHaveProperty('p99');
      expect(stats).toHaveProperty('average');
      expect(stats).toHaveProperty('maxPulls');
    });

    test('P50 应小于 P90', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats.p50).toBeLessThan(stats.p90);
    });

    test('P90 应小于 P95', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats.p90).toBeLessThan(stats.p95);
    });

    test('P95 应小于 P99', () => {
      const resources = { currentLuck: 0, tokens: 0 };
      const target = { pulls: 361 };

      const distribution = calculator.calculateProbabilityDistribution(resources, target, hokLuckConfig);
      const stats = calculator.calculateStatistics(distribution);

      expect(stats.p95).toBeLessThan(stats.p99);
    });
  });

  // ===== 完整 calculate 方法测试 =====

  describe('calculate - 完整计算', () => {
    test('应返回成功的 Result 格式', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('应返回 distribution, statistics, expectedValue', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.data).toHaveProperty('distribution');
      expect(result.data).toHaveProperty('statistics');
      expect(result.data).toHaveProperty('expectedValue');
    });

    test('应返回幸运值信息', () => {
      const params = {
        resources: { currentLuck: 50, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.data.luckValue).toBeDefined();
      expect(result.data.luckValue.initial).toBe(50);
      expect(result.data.luckValue.max).toBe(361);
    });

    test('参数为空应返回错误', () => {
      const result = calculator.calculate(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('资源数据为空应返回错误', () => {
      const params = {
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(false);
    });

    test('配置为空应返回错误', () => {
      const params = {
        resources: { currentLuck: 0 },
        target: { pulls: 100 }
      };

      const result = calculator.calculate(params);

      expect(result.success).toBe(false);
    });
  });

  // ===== 参数验证测试 =====

  describe('validateParams - 参数验证', () => {
    test('有效参数应通过验证', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const validation = calculator.validateParams(params);

      expect(validation.valid).toBe(true);
    });

    test('幸运值为负数应验证失败', () => {
      const params = {
        resources: { currentLuck: -10, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const validation = calculator.validateParams(params);

      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('负数');
    });

    test('基础概率无效应验证失败', () => {
      const invalidConfig = { ...hokLuckConfig, baseRate: 0 };
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: invalidConfig
      };

      const validation = calculator.validateParams(params);

      expect(validation.valid).toBe(false);
    });
  });

  // ===== 缓存功能测试 =====

  describe('缓存功能', () => {
    test('相同参数应命中缓存', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      // 第一次计算
      const result1 = calculator.calculate(params);
      const stats1 = calculator.getCacheStats();

      // 第二次计算（应命中缓存）
      const result2 = calculator.calculate(params);
      const stats2 = calculator.getCacheStats();

      expect(result1.data).toEqual(result2.data);
      expect(stats2.size).toBe(stats1.size);
    });

    test('clearCache 应清除所有缓存', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      calculator.calculate(params);
      expect(calculator.getCacheStats().size).toBeGreaterThan(0);

      calculator.clearCache();
      expect(calculator.getCacheStats().size).toBe(0);
    });

    test('不同参数应生成不同缓存键', () => {
      const params1 = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const params2 = {
        resources: { currentLuck: 50, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      calculator.calculate(params1);
      calculator.calculate(params2);

      expect(calculator.getCacheStats().size).toBe(2);
    });
  });

  // ===== 边界条件测试 =====

  describe('边界条件', () => {
    test('幸运值 0 时应正常计算', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 100 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);
      expect(result.success).toBe(true);
    });

    test('幸运值 360(满)时第一抽应 100% 命中', () => {
      const params = {
        resources: { currentLuck: 360, tokens: 0 },
        target: { pulls: 1 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);
      expect(result.data.distribution[0].singleProbability).toBe(1.0);
      expect(result.data.distribution[0].cumulativeProbability).toBe(1.0);
    });

    test('抽数为 0 时应返回空分布', () => {
      const params = {
        resources: { currentLuck: 0, tokens: 0 },
        target: { pulls: 0 },
        config: hokLuckConfig
      };

      const result = calculator.calculate(params);
      expect(result.data.distribution.length).toBe(0);
    });
  });
});
