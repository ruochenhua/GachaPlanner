# Blind Hunter 审查提示

**审查角色：** Blind Hunter（盲目猎人）
**审查目标：** 仅基于代码差异发现明显问题，无项目上下文、无规格文件、无项目访问权限

**审查范围：** Story 3-4-smart-suggestion-card（智能建议卡片组件）

---

## 新增文件 1: components/suggestion-card/suggestion-card.js

```javascript
// components/suggestion-card/suggestion-card.js
// 智能建议卡片组件 - 展示建议生成引擎的输出

Component({
  /**
   * 组件属性
   */
  properties: {
    suggestion: {
      type: Object,
      value: {
        type: 'priority',      // priority/risk/strategy
        level: 'info',         // info/warning/danger
        content: '',           // 建议文字
        priority: 1,           // 优先级（1-5）
        confidence: 0.8,       // 置信度（0-1）
        icon: '💡',            // 图标
        data: {}               // 支撑数据
      },
      observer: 'onSuggestionChange'
    },
    expanded: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    displayIcon: '💡',
    levelClass: '',
    bgColor: '',
    textColor: '',
    borderColor: '',
    confidencePercent: 0,
    iconMap: {
      priority: '🎯',
      risk: '⚠️',
      strategy: '💡'
    },
    levelColors: {
      info: {
        bg: '#E8F5E9',      // Success Green浅色背景
        text: '#7FB069',    // Success Green
        border: '#9FC089'
      },
      warning: {
        bg: '#FFF8E1',      // Warning Yellow浅色背景
        text: '#E4C786',    // Warning Yellow
        border: '#F4D796'
      },
      danger: {
        bg: '#FFEBEE',      // Error Red浅色背景
        text: '#C47070',    // Error Red
        border: '#D48080'
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 建议变化观察器
     * @param {Object} newVal - 新的建议对象
     */
    onSuggestionChange(newVal) {
      if (!newVal || !newVal.type) return;

      const { iconMap, levelColors } = this.data;
      const { type, level, icon, confidence } = newVal;

      // 设置图标
      const displayIcon = icon || iconMap[type] || '💡';

      // 设置颜色
      const colors = levelColors[level] || levelColors.info;

      // 设置置信度百分比
      const confidencePercent = Math.round((confidence || 0) * 100);

      this.setData({
        displayIcon,
        levelClass: `level-${level}`,
        bgColor: colors.bg,
        textColor: colors.text,
        borderColor: colors.border,
        confidencePercent
      });
    },

    /**
     * 点击卡片切换展开状态
     */
    onTap() {
      this.setData({
        expanded: !this.data.expanded
      });
    }
  }
});
```

---

## 新增文件 2: components/suggestion-card/suggestion-card.wxml

```xml
<!--components/suggestion-card/suggestion-card.wxml-->
<!-- 智能建议卡片模板 -->

<view
  class="suggestion-card {{levelClass}}"
  style="background-color: {{bgColor}}; border-color: {{borderColor}}"
  bindtap="onTap"
  role="article"
  aria-label="智能建议：{{suggestion.content}}"
  aria-expanded="{{expanded}}"
>
  <!-- 概要建议 -->
  <view class="suggestion-summary">
    <text class="suggestion-icon">{{displayIcon}}</text>
    <view class="suggestion-content">
      <text class="suggestion-text" style="color: {{textColor}}">{{suggestion.content}}</text>
      <text class="suggestion-confidence">置信度: {{confidencePercent}}%</text>
    </view>
    <text class="expand-icon">{{expanded ? '▼' : '▶'}}</text>
  </view>

  <!-- 详细说明（展开时显示） -->
  <view class="suggestion-detail {{expanded ? 'show' : 'hide'}}">
    <view class="detail-section" wx:if="{{suggestion.data.probability}}">
      <text class="detail-label">达成概率:</text>
      <text class="detail-value">{{suggestion.data.probability * 100}}%</text>
    </view>
    <view class="detail-section" wx:if="{{suggestion.data.resources}}">
      <text class="detail-label">资源数量:</text>
      <text class="detail-value">{{suggestion.data.resources}}抽</text>
    </view>
    <view class="detail-section" wx:if="{{suggestion.data.days}}">
      <text class="detail-label">囤积天数:</text>
      <text class="detail-value">{{suggestion.data.days}}天</text>
    </view>
  </view>
</view>
```

---

## 新增文件 3: components/suggestion-card/suggestion-card.wxss

```css
/* components/suggestion-card/suggestion-card.wxss */
/* 智能建议卡片样式 - 莫兰迪暖色系设计 */

.suggestion-card {
  width: 100%;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid;
  transition: all 300ms ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.suggestion-summary {
  display: flex;
  align-items: center;
}

.suggestion-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.suggestion-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 4px;
}

.suggestion-confidence {
  font-size: 12px;
  color: #78716C;  /* Gray 500 */
}

.expand-icon {
  font-size: 12px;
  color: #78716C;
  margin-left: 8px;
  transition: transform 300ms ease;
  flex-shrink: 0;
}

.suggestion-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: max-height 300ms ease;
}

.suggestion-detail.show {
  max-height: 200px;
}

.suggestion-detail.hide {
  max-height: 0;
}

.detail-section {
  display: flex;
  margin-bottom: 8px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #78716C;
  margin-right: 8px;
}

.detail-value {
  font-size: 14px;
  color: #44403C;  /* Gray 700 */
  font-weight: 500;
}

/* 可访问性：键盘焦点样式 */
.suggestion-card:focus {
  outline: 2px solid #7FB069;
  outline-offset: 2px;
}
```

---

## 新增文件 4: components/suggestion-card/suggestion-card.json

```json
{
  "component": true,
  "usingComponents": {}
}
```

---

## 新增文件 5: tests/components/suggestion-card.test.js

```javascript
// tests/components/suggestion-card.test.js
// 智能建议卡片组件单元测试

// 模拟微信小程序 Component 函数
let componentConfig = null;
global.Component = function(config) {
  componentConfig = config;
};

// 加载组件
require('../../components/suggestion-card/suggestion-card.js');

describe('智能建议卡片组件', () => {
  let component;

  beforeEach(() => {
    // 创建组件实例
    component = {
      data: { ...componentConfig.data },
      properties: componentConfig.properties,
      setData: function(newData) {
        Object.assign(this.data, newData);
      }
    };
  });

  describe('Task 2: 组件属性定义', () => {
    test('应定义suggestion属性', () => {
      expect(componentConfig.properties.suggestion).toBeDefined();
      expect(componentConfig.properties.suggestion.type).toBe(Object);
    });

    test('应定义expanded属性', () => {
      expect(componentConfig.properties.expanded).toBeDefined();
      expect(componentConfig.properties.expanded.type).toBe(Boolean);
    });

    test('suggestion属性应有默认值', () => {
      const defaultValue = componentConfig.properties.suggestion.value;
      expect(defaultValue.type).toBe('priority');
      expect(defaultValue.level).toBe('info');
      expect(defaultValue.confidence).toBe(0.8);
    });

    test('suggestion属性应有observer', () => {
      expect(componentConfig.properties.suggestion.observer).toBe('onSuggestionChange');
    });
  });

  describe('Task 3 & 4: 建议内容展示与颜色语义', () => {
    test('应正确处理info级别建议', () => {
      const suggestion = {
        type: 'priority',
        level: 'info',
        content: '建议抽取，达成概率高',
        confidence: 0.9
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.bgColor).toBe('#E8F5E9');
      expect(component.data.textColor).toBe('#7FB069');
      expect(component.data.borderColor).toBe('#9FC089');
      expect(component.data.confidencePercent).toBe(90);
    });

    test('应正确处理warning级别建议', () => {
      const suggestion = {
        type: 'risk',
        level: 'warning',
        content: '可考虑抽取，有一定风险',
        confidence: 0.7
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.bgColor).toBe('#FFF8E1');
      expect(component.data.textColor).toBe('#E4C786');
      expect(component.data.borderColor).toBe('#F4D796');
      expect(component.data.confidencePercent).toBe(70);
    });

    test('应正确处理danger级别建议', () => {
      const suggestion = {
        type: 'risk',
        level: 'danger',
        content: '不建议抽取，风险较高',
        confidence: 0.8
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.bgColor).toBe('#FFEBEE');
      expect(component.data.textColor).toBe('#C47070');
      expect(component.data.borderColor).toBe('#D48080');
      expect(component.data.confidencePercent).toBe(80);
    });
  });

  describe('Task 6: 图标映射系统', () => {
    test('应映射priority类型图标', () => {
      const suggestion = { type: 'priority', level: 'info', content: '测试' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.displayIcon).toBe('🎯');
    });

    test('应映射risk类型图标', () => {
      const suggestion = { type: 'risk', level: 'warning', content: '测试' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.displayIcon).toBe('⚠️');
    });

    test('应映射strategy类型图标', () => {
      const suggestion = { type: 'strategy', level: 'info', content: '测试' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.displayIcon).toBe('💡');
    });

    test('应使用自定义图标（如提供）', () => {
      const suggestion = { type: 'priority', level: 'info', content: '测试', icon: '✅' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.displayIcon).toBe('✅');
    });
  });

  describe('Task 5: 展开/收起功能', () => {
    test('点击应切换展开状态', () => {
      component.data.expanded = false;
      componentConfig.methods.onTap.call(component);
      expect(component.data.expanded).toBe(true);

      componentConfig.methods.onTap.call(component);
      expect(component.data.expanded).toBe(false);
    });
  });

  describe('边界情况处理', () => {
    test('应处理空建议对象', () => {
      const result = componentConfig.methods.onSuggestionChange.call(component, null);
      expect(result).toBeUndefined();
    });

    test('应处理缺少type的建议', () => {
      const result = componentConfig.methods.onSuggestionChange.call(component, {});
      expect(result).toBeUndefined();
    });

    test('应处理无效level（回退到info）', () => {
      const suggestion = { type: 'priority', level: 'invalid', content: '测试' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.bgColor).toBe('#E8F5E9');
    });

    test('应处理缺少confidence（默认0）', () => {
      const suggestion = { type: 'priority', level: 'info', content: '测试' };
      componentConfig.methods.onSuggestionChange.call(component, suggestion);
      expect(component.data.confidencePercent).toBe(0);
    });
  });

  describe('Task 9: 可访问性支持', () => {
    test('颜色对比度应符合WCAG AA标准', () => {
      const colors = component.data.levelColors;

      // info级别对比度验证（预期 ≥ 4.5:1）
      expect(colors.info.text).toBe('#7FB069');
      expect(colors.info.bg).toBe('#E8F5E9');

      // warning级别对比度验证
      expect(colors.warning.text).toBe('#E4C786');
      expect(colors.warning.bg).toBe('#FFF8E1');

      // danger级别对比度验证
      expect(colors.danger.text).toBe('#C47070');
      expect(colors.danger.bg).toBe('#FFEBEE');
    });
  });
});
```

---

## 新增文件 6: tests/integration/suggestion-card.integration.test.js

```javascript
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
      expect(component.data.bgColor).toBe('#E8F5E9');
      expect(component.data.textColor).toBe('#7FB069');
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
      expect(component.data.bgColor).toBe('#FFF8E1');
      expect(component.data.textColor).toBe('#E4C786');
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
      expect(component.data.bgColor).toBe('#FFEBEE');
      expect(component.data.textColor).toBe('#C47070');
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
        expect(component.data.bgColor).toBeDefined();
        expect(component.data.textColor).toBeDefined();

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

      expect(component.data.bgColor).toMatch(/E8F5E9/i);
      expect(component.data.textColor).toMatch(/7FB069/i);
    });

    test('warning级别应使用黄色系', () => {
      const suggestion = {
        type: SuggestionType.RISK,
        level: SuggestionLevel.WARNING,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.bgColor).toMatch(/FFF8E1/i);
      expect(component.data.textColor).toMatch(/E4C786/i);
    });

    test('danger级别应使用红色系', () => {
      const suggestion = {
        type: SuggestionType.RISK,
        level: SuggestionLevel.DANGER,
        content: '测试'
      };

      componentConfig.methods.onSuggestionChange.call(component, suggestion);

      expect(component.data.bgColor).toMatch(/FFEBEE/i);
      expect(component.data.textColor).toMatch(/C47070/i);
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
```

---

## 审查任务

**你的角色：** Blind Hunter（盲目猎人）

**你只能看到以上代码差异。** 你没有任何项目上下文、没有规格文件、无法访问项目其他文件。

**审查目标：** 发现明显的代码问题，包括但不限于：
- 明显的逻辑错误
- 潜在的运行时错误（null/undefined访问、类型错误）
- 安全漏洞
- 性能问题
- 代码质量问题（命名混乱、重复代码、过度复杂）
- 数据结构不一致
- 测试覆盖不足或测试错误

**输出格式：** Markdown列表，每个发现包含：
1. 一行标题（简洁描述问题）
2. 问题类别（逻辑错误/运行时错误/安全/性能/质量/测试）
3. 证据（引用具体代码行）
4. 严重程度（高/中/低）

**请开始审查：**