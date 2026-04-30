// tests/integration/suggestion-generation.integration.test.js
// 建议生成引擎集成测试

const SuggestionGenerator = require('../../core/suggestion/suggestion-generator');
const { SuggestionType, SuggestionLevel } = require('../../core/suggestion/constants');

describe('建议生成引擎集成测试', () => {
  let generator;

  beforeEach(() => {
    generator = new SuggestionGenerator();
  });

  // Task 10.1: 测试单卡池高概率建议生成
  describe('单卡池高概率场景', () => {
    test('应生成完整的建议结果', () => {
      const calcResult = { probability: 0.85, pityType: 'soft' };
      const resources = { primogems: 16000, currentPity: 20 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      // 验证Result模式
      expect(result.success).toBe(true);
      expect(result.data.suggestions).toBeDefined();
      expect(result.data.primary).toBeDefined();
      expect(result.data.confidence).toBeGreaterThan(0.8);

      // 验证建议内容
      expect(result.data.primary.content).toBe('建议抽取，达成概率高');
      expect(result.data.primary.level).toBe(SuggestionLevel.INFO);
    });
  });

  // Task 10.2: 测试单卡池低概率建议生成
  describe('单卡池低概率场景', () => {
    test('应生成风险警告和囤积建议', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);
      expect(result.data.suggestions.length).toBeGreaterThan(1);

      // 验证风险建议
      const riskSuggestion = result.data.suggestions.find(s => s.type === SuggestionType.RISK);
      expect(riskSuggestion).toBeDefined();
      expect(riskSuggestion.level).toBe(SuggestionLevel.DANGER);

      // 验证囤积建议
      const hoardingSuggestion = result.data.suggestions.find(s => s.type === SuggestionType.STRATEGY);
      expect(hoardingSuggestion).toBeDefined();
      expect(hoardingSuggestion.content).toMatch(/囤积\d+天/);
    });
  });

  // Task 10.3: 测试资源不足囤积建议生成
  describe('资源不足囤积场景', () => {
    test('应准确计算囤积天数', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 }; // 20抽
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 }; // 缺60抽=9600原石，需160天

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);

      const hoardingSuggestion = result.data.suggestions.find(
        s => s.type === SuggestionType.STRATEGY
      );

      expect(hoardingSuggestion).toBeDefined();
      expect(hoardingSuggestion.data.days).toBe(160);
      expect(hoardingSuggestion.data.resources).toBe(60);
    });
  });

  // Task 10.4: 测试多卡池优先级建议生成
  describe('多卡池优先级场景', () => {
    test('应生成优先级排序建议', () => {
      const pools = [
        { id: 'pool1', name: '星铁池', probability: 0.85, resourceNeeded: 80, startDate: new Date(Date.now() + 5 * 86400000) },
        { id: 'pool2', name: '原神池', probability: 0.65, resourceNeeded: 60, startDate: new Date(Date.now() + 10 * 86400000) }
      ];
      const totalResources = 100;

      const result = generator.generateMultiPoolSuggestions(pools, totalResources);

      expect(result.success).toBe(true);
      expect(result.data.suggestions.length).toBeGreaterThan(0);

      // 验证优先级建议
      const prioritySuggestion = result.data.suggestions.find(
        s => s.type === SuggestionType.PRIORITY
      );
      expect(prioritySuggestion).toBeDefined();
      expect(prioritySuggestion.content).toContain('星铁池');

      // 验证策略分析
      expect(result.data.strategyAnalysis.priorityOrder).toBeDefined();
      expect(result.data.strategyAnalysis.priorityOrder[0].poolId).toBe('pool1');
    });
  });

  // Task 10.5: 验证建议内容具体可执行
  describe('建议内容质量验证', () => {
    test('所有建议应具体可执行', () => {
      const calcResult = { probability: 0.65, pityType: 'soft' };
      const resources = { primogems: 8000, currentPity: 30 };
      const target = { requiredPulls: 60, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);

      result.data.suggestions.forEach(suggestion => {
        // 验证建议内容不为空
        expect(suggestion.content).toBeDefined();
        expect(suggestion.content.length).toBeGreaterThan(0);

        // 验证建议内容简洁（≤50字）
        expect(suggestion.content.length).toBeLessThanOrEqual(50);

        // 验证建议包含关键信息
        expect(suggestion.content).toMatch(/建议|可考虑|不建议|距离|囤积/);

        // 验证置信度在合理范围
        expect(suggestion.confidence).toBeGreaterThan(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  // 性能测试（阈值在 CI/慢机上放宽，避免 wall-clock 误报）
  describe('性能测试', () => {
    const singleMs = process.env.CI ? 200 : 50;
    const multiMs = process.env.CI ? 400 : 100;

    test('单卡池建议生成应在预算内完成', () => {
      const calcResult = { probability: 0.85, pityType: 'soft' };
      const resources = { primogems: 16000, currentPity: 20 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const startTime = Date.now();
      const result = generator.generate(calcResult, resources, target);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(singleMs);
    });

    test('多卡池建议生成应在预算内完成', () => {
      const pools = [
        { id: 'pool1', probability: 0.85, resourceNeeded: 80, startDate: new Date() },
        { id: 'pool2', probability: 0.65, resourceNeeded: 60, startDate: new Date() },
        { id: 'pool3', probability: 0.75, resourceNeeded: 70, startDate: new Date() }
      ];
      const totalResources = 150;

      const startTime = Date.now();
      const result = generator.generateMultiPoolSuggestions(pools, totalResources);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(multiMs);
    });
  });

  // 边界情况测试
  describe('边界情况处理', () => {
    test('应处理概率为0的情况', () => {
      const calcResult = { probability: 0, pityType: 'soft' };
      const resources = { primogems: 0, currentPity: 0 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);
      expect(result.data.primary.level).toBe(SuggestionLevel.DANGER);
    });

    test('应处理概率为1的情况', () => {
      const calcResult = { probability: 1, pityType: 'hard' };
      const resources = { primogems: 20000, currentPity: 89 };
      const target = { requiredPulls: 90, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);
      expect(result.data.primary.level).toBe(SuggestionLevel.INFO);
    });

    test('应处理资源不足且接近保底的情况', () => {
      const calcResult = { probability: 0.95, pityType: 'hard' };
      const resources = { primogems: 1600, currentPity: 80 }; // 距离保底10抽
      const target = { requiredPulls: 90, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      expect(result.success).toBe(true);

      // 应同时包含风险建议和保底建议
      const pitySuggestion = result.data.suggestions.find(s => s.content.includes('保底'));
      expect(pitySuggestion).toBeDefined();
    });
  });
});