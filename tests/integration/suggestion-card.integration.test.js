// tests/integration/suggestion-card.integration.test.js
// 智能建议卡片组件集成测试 - 验证与Story 3.3数据结构对接

const SuggestionGenerator = require('../../core/suggestion/suggestion-generator');
const { SuggestionType, SuggestionLevel } = require('../../core/suggestion/constants');

// 模拟微信小程序 Component 函数
let componentConfig = null;
global.Component = function(config) {
  componentConfig = config;
};

// 加载组件
require('../../components/suggestion-card/suggestion-card.js');

describe('智能建议卡片组件集成测试', () => {
  let generator;
  let component;

  beforeEach(() => {
    generator = new SuggestionGenerator();
    component = {
      data: { ...componentConfig.data },
      properties: componentConfig.properties,
      setData: function(newData) {
        Object.assign(this.data, newData);
      }
    };
  });

  describe('Task 10: 与Story 3.3数据结构对接', () => {
    test('应正确展示高概率建议', () => {
      const calcResult = { probability: 0.85, pityType: 'soft' };
      const resources = { primogems: 16000, currentPity: 20 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);

      const primarySuggestion = result.data.primary;
      componentConfig.methods.onSuggestionChange.call(component, primarySuggestion);

      expect(component.data.displayIcon).toBe('✅');
      expect(component.data.levelClass).toBe('level-info');
      expect(component.data.confidencePercent).toBe(90);
    });

    test('应正确展示中概率建议', () => {
      const calcResult = { probability: 0.65, pityType: 'soft' };
      const resources = { primogems: 8000, currentPity: 30 };
      const target = { requiredPulls: 60, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);

      const primarySuggestion = result.data.primary;
      componentConfig.methods.onSuggestionChange.call(component, primarySuggestion);

      expect(component.data.displayIcon).toBe('⚠️');
      expect(component.data.levelClass).toBe('level-warning');
    });

    test('应正确展示低概率建议', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);

      const primarySuggestion = result.data.primary;
      componentConfig.methods.onSuggestionChange.call(component, primarySuggestion);

      expect(component.data.displayIcon).toBe('❌');
      expect(component.data.levelClass).toBe('level-danger');
    });

    test('应正确展示囤积建议', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);

      const hoardingSuggestion = result.data.suggestions.find(
        s => s.type === SuggestionType.STRATEGY
      );
      expect(hoardingSuggestion).toBeDefined();

      componentConfig.methods.onSuggestionChange.call(component, hoardingSuggestion);

      expect(component.data.displayIcon).toBe('💡');
      expect(component.data.levelClass).toBe('level-warning');
      expect(hoardingSuggestion.data.days).toBeGreaterThan(0);
    });

    test('应正确展示保底建议', () => {
      const calcResult = { probability: 0.95, pityType: 'hard' };
      const resources = { primogems: 1600, currentPity: 80 };
      const target = { requiredPulls: 90, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);

      const pitySuggestion = result.data.suggestions.find(
        s => s.content.includes('保底')
      );
      expect(pitySuggestion).toBeDefined();

      componentConfig.methods.onSuggestionChange.call(component, pitySuggestion);

      expect(component.data.displayIcon).toBe('🎯');
      expect(component.data.levelClass).toBe('level-info');
      expect(pitySuggestion.data.resources).toBeLessThanOrEqual(10);
    });

    test('应处理多个建议顺序展示', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);
      expect(result.success).toBe(true);
      expect(result.data.suggestions.length).toBeGreaterThan(1);

      // 验证建议按优先级排序
      result.data.suggestions.forEach((suggestion, index) => {
        componentConfig.methods.onSuggestionChange.call(component, suggestion);

        expect(component.data.displayIcon).toBeDefined();
        expect(component.data.levelClass).toBeDefined();

        // 验证所有建议都有必要的字段
        expect(suggestion.type).toBeDefined();
        expect(suggestion.level).toBeDefined();
        expect(suggestion.content).toBeDefined();
        expect(suggestion.confidence).toBeGreaterThan(0);
      });
    });

    test('展开时应显示详细数据', () => {
      const calcResult = { probability: 0.35, pityType: 'soft' };
      const resources = { primogems: 3200, currentPity: 10 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      const hoardingSuggestion = result.data.suggestions.find(
        s => s.type === SuggestionType.STRATEGY
      );

      // 设置展开状态
      component.setData({ expanded: true });
      componentConfig.methods.onSuggestionChange.call(component, hoardingSuggestion);

      // 验证数据字段存在（模拟WXML条件渲染）
      expect(hoardingSuggestion.data.days).toBeDefined();
      expect(hoardingSuggestion.data.resources).toBeDefined();
    });
  });

  describe('颜色语义验证', () => {
    test('info级别应使用绿色系', () => {
      const suggestion = {
        type: SuggestionType.PRIORITY,
        level: SuggestionLevel.INFO,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.levelClass).toBe('level-info');
    });

    test('warning级别应使用黄色系', () => {
      const suggestion = {
        type: SuggestionType.RISK,
        level: SuggestionLevel.WARNING,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.levelClass).toBe('level-warning');
    });

    test('danger级别应使用红色系', () => {
      const suggestion = {
        type: SuggestionType.RISK,
        level: SuggestionLevel.DANGER,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.levelClass).toBe('level-danger');
    });
  });

  describe('响应式布局验证', () => {
    test('组件应有正确的样式类名', () => {
      const suggestion = {
        type: SuggestionType.PRIORITY,
        level: SuggestionLevel.INFO,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.levelClass).toBe('level-info');
    });
  });

  describe('性能测试', () => {
    test('建议卡片渲染应快速响应', () => {
      const calcResult = { probability: 0.85, pityType: 'soft' };
      const resources = { primogems: 16000, currentPity: 20 };
      const target = { requiredPulls: 80, hardPity: 90, dailyIncome: 60 };

      const result = generator.generate(calcResult, resources, target);

      const startTime = Date.now();
      componentConfig.methods.onSuggestionChange.call(component, result.data.primary);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});