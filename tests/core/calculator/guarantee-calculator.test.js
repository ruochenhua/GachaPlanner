const GuaranteeCalculator = require('../../../core/calculator/guarantee-calculator');

describe('GuaranteeCalculator - 大小保底计算', () => {
  let calculator;
  const config = {
    gameId: 'genshin',
    baseRate: 0.006,
    hardPity: 90,
    softPityStart: 74,
    softPityIncrement: 0.06,
    guaranteeRate: 0.5
  };

  beforeEach(() => {
    calculator = new GuaranteeCalculator();
    calculator.clearCache();
  });

  test('小保底 90 抽概率应接近 100%（soft pity + hard pity 机制）', () => {
    const result = calculator.calculate({
      resources: {},
      target: { pulls: 90, currentPity: 0, isGuaranteed: false },
      config
    });
    expect(result.success).toBe(true);
    const finalProb = result.data[result.data.length - 1].cumulativeProbability;
    expect(finalProb).toBeGreaterThan(0.99);
  });

  test('大保底 90 抽概率应为 100%', () => {
    const result = calculator.calculate({
      resources: {},
      target: { pulls: 90, currentPity: 0, isGuaranteed: true },
      config
    });
    expect(result.success).toBe(true);
    const finalProb = result.data[result.data.length - 1].cumulativeProbability;
    expect(finalProb).toBeCloseTo(1.0, 1);
  });

  test('大小保底概率差异在 90 抽时很小（soft pity + hard pity 机制）', () => {
    const smallPity = calculator.calculate({
      resources: {},
      target: { pulls: 90, currentPity: 0, isGuaranteed: false },
      config
    });
    const bigPity = calculator.calculate({
      resources: {},
      target: { pulls: 90, currentPity: 0, isGuaranteed: true },
      config
    });
    const smallProb = smallPity.data[smallPity.data.length - 1].cumulativeProbability;
    const bigProb = bigPity.data[bigPity.data.length - 1].cumulativeProbability;
    // 90 抽时差异极小（soft pity 机制使得两者都接近 100%）
    expect(bigProb - smallProb).toBeLessThan(0.01);
  });

  test('isGuaranteed 为 undefined 时应按 false 处理', () => {
    const result = calculator.calculate({
      resources: {},
      target: { pulls: 90, currentPity: 0 }, // 没有 isGuaranteed
      config
    });
    expect(result.success).toBe(true);
    const finalProb = result.data[result.data.length - 1].cumulativeProbability;
    expect(finalProb).toBeGreaterThan(0.99);
  });

  test('武器类型 guaranteeRate=0.75 时小保底概率应接近 100%', () => {
    const weaponConfig = { ...config, hardPity: 80, guaranteeRate: 0.75 };
    const result = calculator.calculate({
      resources: {},
      target: { pulls: 80, currentPity: 0, isGuaranteed: false },
      config: weaponConfig
    });
    expect(result.success).toBe(true);
    const finalProb = result.data[result.data.length - 1].cumulativeProbability;
    expect(finalProb).toBeGreaterThan(0.95);
  });

  test('10 抽时大小保底概率有明显差异（约 2 倍）', () => {
    const smallPity = calculator.calculate({
      resources: {},
      target: { pulls: 10, currentPity: 0, isGuaranteed: false },
      config
    });
    const bigPity = calculator.calculate({
      resources: {},
      target: { pulls: 10, currentPity: 0, isGuaranteed: true },
      config
    });
    const smallProb = smallPity.data[smallPity.data.length - 1].cumulativeProbability;
    const bigProb = bigPity.data[bigPity.data.length - 1].cumulativeProbability;
    // 10 抽时大保底约为小保底的 2 倍
    expect(bigProb / smallProb).toBeCloseTo(2.0, 0);
  });
});
