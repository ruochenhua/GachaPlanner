// tests/core/suggestion/suggestion-generator.test.js
// 建议生成器单元测试

const SuggestionGenerator = require('../../../core/suggestion/suggestion-generator');
const { SuggestionType, SuggestionLevel, SuggestionIcon } = require('../../../core/suggestion/constants');

describe('SuggestionGenerator - 单卡池建议生成', () => {
  let generator;

  beforeEach(() => {
    generator = new SuggestionGenerator();
  });

  // Task 6.1: 高概率（≥80%）："建议抽取，达成概率高"
  test('高概率(85%)应生成建议抽取的建议', () => {
    const calcResult = { probability: 0.85, pityType: 'soft' };
    const resources = { primogems: 16000, currentPity: 20 };
    const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(true);
    expect(result.data.suggestions).toBeDefined();
    expect(result.data.suggestions.length).toBeGreaterThan(0);
    expect(result.data.primary).toBeDefined();

    const primarySuggestion = result.data.primary;
    expect(primarySuggestion.type).toBe(SuggestionType.PRIORITY);
    expect(primarySuggestion.level).toBe(SuggestionLevel.INFO);
    expect(primarySuggestion.content).toBe('建议抽取，达成概率高');
    expect(primarySuggestion.icon).toBe(SuggestionIcon.SUCCESS);
    expect(primarySuggestion.confidence).toBeGreaterThan(0.8);
  });

  // Task 6.2: 中概率（50-80%）："可考虑抽取，有一定风险"
  test('中概率(65%)应生成可考虑抽取的建议', () => {
    const calcResult = { probability: 0.65, pityType: 'soft' };
    const resources = { primogems: 8000, currentPity: 30 };
    const target = { requiredPulls: 60, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(true);
    expect(result.data.primary.type).toBe(SuggestionType.RISK);
    expect(result.data.primary.level).toBe(SuggestionLevel.WARNING);
    expect(result.data.primary.content).toBe('可考虑抽取，有一定风险');
    expect(result.data.primary.icon).toBe(SuggestionIcon.WARNING);
  });

  // Task 6.3: 低概率（<50%）："不建议抽取，风险较高"
  test('低概率(35%)应生成不建议抽取的建议', () => {
    const calcResult = { probability: 0.35, pityType: 'soft' };
    const resources = { primogems: 3200, currentPity: 10 };
    const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(true);
    expect(result.data.primary.type).toBe(SuggestionType.RISK);
    expect(result.data.primary.level).toBe(SuggestionLevel.DANGER);
    expect(result.data.primary.content).toBe('不建议抽取，风险较高');
    expect(result.data.primary.icon).toBe(SuggestionIcon.DANGER);
  });

  // Task 6.4: 资源不足时："建议囤积X天后再抽"
  test('资源不足时应生成囤积建议', () => {
    const calcResult = { probability: 0.35, pityType: 'soft' };
    const resources = { primogems: 3200, currentPity: 10 }; // 3200/160 = 20抽
    const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(true);

    // 查找囤积建议
    const hoardingSuggestion = result.data.suggestions.find(
      s => s.type === SuggestionType.STRATEGY && s.content.includes('囤积')
    );

    expect(hoardingSuggestion).toBeDefined();
    expect(hoardingSuggestion.content).toMatch(/建议囤积\d+天后再抽/);
    expect(hoardingSuggestion.icon).toBe(SuggestionIcon.IDEA);
    expect(hoardingSuggestion.data.days).toBeDefined();
  });

  // Task 6.5: 接近保底时："距离保底X抽，保底概率高"
  test('接近保底(距离10抽内)应生成保底建议', () => {
    const calcResult = { probability: 0.95, pityType: 'hard' };
    const resources = { primogems: 1600, currentPity: 80 }; // 距离保底10抽
    const target = { requiredPulls: 90, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(true);

    // 查找保底建议
    const pitySuggestion = result.data.suggestions.find(
      s => s.content.includes('距离保底')
    );

    expect(pitySuggestion).toBeDefined();
    expect(pitySuggestion.content).toMatch(/距离保底\d+抽/);
    expect(pitySuggestion.icon).toBe(SuggestionIcon.TARGET);
    expect(pitySuggestion.confidence).toBeGreaterThan(0.9);
  });

  // Task 9.1-9.5: 置信度计算测试
  test('置信度计算应考虑数据完整性和保底机制', () => {
    const calcResult1 = { probability: 0.85, pityType: 'soft' };
    const resources1 = { primogems: 16000 }; // 缺少currentPity
    const target1 = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result1 = generator.generate(calcResult1, resources1, target1);
    expect(result1.data.confidence).toBeLessThan(0.9);

    const calcResult2 = { probability: 0.85, pityType: 'hard' };
    const resources2 = { primogems: 16000, currentPity: 20 };
    const target2 = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result2 = generator.generate(calcResult2, resources2, target2);
    expect(result2.data.confidence).toBeGreaterThan(result1.data.confidence);
  });

  // Result模式测试
  test('应返回Result模式的标准格式', () => {
    const calcResult = { probability: 0.85, pityType: 'soft' };
    const resources = { primogems: 16000, currentPity: 20 };
    const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('suggestions');
    expect(result.data).toHaveProperty('primary');
    expect(result.data).toHaveProperty('confidence');
  });

  test('异常情况应返回error结果', () => {
    const calcResult = null; // 无效输入
    const resources = { primogems: 16000, currentPity: 20 };
    const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

    const result = generator.generate(calcResult, resources, target);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});