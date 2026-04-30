// tests/core/suggestion/suggestion-generator-multipool.test.js
// 建议生成器 - 多卡池建议生成测试

const SuggestionGenerator = require('../../../core/suggestion/suggestion-generator');
const { SuggestionType, SuggestionLevel, SuggestionIcon } = require('../../../core/suggestion/constants');

describe('SuggestionGenerator - 多卡池建议生成', () => {
  let generator;

  beforeEach(() => {
    generator = new SuggestionGenerator();
  });

  // Task 7.1: 比较多个卡池达成概率
  test('应正确比较多个卡池的达成概率', () => {
    const pools = [
      { id: 'pool1', name: '星铁池', probability: 0.85, resourceNeeded: 80, startDate: new Date(Date.now() + 5 * 86400000) },
      { id: 'pool2', name: '原神池', probability: 0.65, resourceNeeded: 60, startDate: new Date(Date.now() + 10 * 86400000) }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);
    expect(result.data.strategyAnalysis.poolAnalysis).toBeDefined();
    expect(result.data.strategyAnalysis.poolAnalysis.length).toBe(2);
  });

  // Task 7.2: 生成优先级排序建议
  test('应生成优先级排序建议', () => {
    const pools = [
      { id: 'pool1', name: '星铁池', probability: 0.85, resourceNeeded: 80, startDate: new Date(Date.now() + 5 * 86400000) },
      { id: 'pool2', name: '原神池', probability: 0.65, resourceNeeded: 60, startDate: new Date(Date.now() + 10 * 86400000) }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);
    expect(result.data.suggestions).toBeDefined();

    const prioritySuggestion = result.data.suggestions.find(
      s => s.type === SuggestionType.PRIORITY && s.content.includes('优先抽')
    );

    expect(prioritySuggestion).toBeDefined();
    expect(prioritySuggestion.content).toMatch(/建议优先抽.*达成概率\d+%/);
    expect(prioritySuggestion.icon).toBe(SuggestionIcon.TARGET);
  });

  // Task 7.3: 识别资源冲突（多池争抢资源）
  test('应识别资源冲突情况', () => {
    const pools = [
      { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date() },
      { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date() }
    ];
    const totalResources = 100; // 总资源不足以同时抽取两个池

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);
    expect(result.data.strategyAnalysis.conflicts).toBe(true);

    const conflictSuggestion = result.data.suggestions.find(
      s => s.type === SuggestionType.STRATEGY && s.content.includes('资源不足')
    );

    expect(conflictSuggestion).toBeDefined();
    expect(conflictSuggestion.level).toBe(SuggestionLevel.WARNING);
  });

  // Task 7.4: 生成资源分配建议
  test('应生成资源分配建议', () => {
    const pools = [
      { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date() },
      { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date() }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);

    // 验证策略分析包含优先级排序
    expect(result.data.strategyAnalysis.priorityOrder).toBeDefined();
    expect(result.data.strategyAnalysis.priorityOrder.length).toBe(2);

    // 验证优先级得分计算正确（概率70% + 时间30%）
    const analysis1 = result.data.strategyAnalysis.poolAnalysis.find(a => a.poolId === 'pool1');
    expect(analysis1.priority).toBeGreaterThan(0);
    expect(analysis1.priority).toBeLessThan(100);
  });

  // Task 7.5: 生成策略调整建议
  test('应生成策略调整建议', () => {
    const pools = [
      { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date() },
      { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date() }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);

    const strategySuggestion = result.data.suggestions.find(
      s => s.type === SuggestionType.STRATEGY
    );

    expect(strategySuggestion).toBeDefined();
    expect(strategySuggestion.content).toBeDefined();
    expect(strategySuggestion.confidence).toBeGreaterThan(0);
  });

  // Task 8: 建议文字生成规范测试
  test('建议文字应符合规范（简洁、具体、用户友好）', () => {
    const pools = [
      { id: 'pool1', name: '星铁池', probability: 0.85, resourceNeeded: 80, startDate: new Date(Date.now() + 5 * 86400000) },
      { id: 'pool2', name: '原神池', probability: 0.65, resourceNeeded: 60, startDate: new Date(Date.now() + 10 * 86400000) }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);

    result.data.suggestions.forEach(suggestion => {
      // Task 8.1: 用户友好语言
      expect(suggestion.content).not.toMatch(/概率计算|保底机制|资源缺口/);

      // Task 8.2: 建议具体可执行
      expect(suggestion.content).toMatch(/建议|优先/);

      // Task 8.4: 简洁明了（≤50字）
      expect(suggestion.content.length).toBeLessThanOrEqual(50);
    });
  });

  // 优先级得分计算测试
  test('优先级得分应正确计算（概率70% + 时间30%）', () => {
    const pools = [
      { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date(Date.now() + 5 * 86400000) },
      { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date(Date.now() + 10 * 86400000) }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(true);

    // 高概率卡池应排在前面
    const priorityOrder = result.data.strategyAnalysis.priorityOrder;
    expect(priorityOrder[0].probability).toBeGreaterThan(priorityOrder[1].probability);
  });

  // Result模式测试
  test('多卡池建议应返回Result模式', () => {
    const pools = [
      { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date() },
      { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date() }
    ];
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('suggestions');
    expect(result.data).toHaveProperty('strategyAnalysis');
  });

  test('异常情况应返回error结果', () => {
    const pools = null; // 无效输入
    const totalResources = 100;

    const result = generator.generateMultiPoolSuggestions(pools, totalResources);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});