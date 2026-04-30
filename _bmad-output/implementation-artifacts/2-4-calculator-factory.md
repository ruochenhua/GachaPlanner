# Story 2.4: 计算器工厂实现

Status: done

## Completion Notes

Story 2.4: 计算器工厂实现已完成。

**实现内容：**
1. ✓ 创建计算器工厂类 - CalculatorFactory
2. ✓ 实现工厂创建逻辑 - 根据pityType创建对应计算器
3. ✓ 实现统一接口 - 所有计算器继承BaseCalculator
4. ✓ 支持扩展性 - registerCalculator方法
5. ✓ 验证工厂功能 - Console输出测试结果

**关键技术实现：**
- 静态方法createCalculator根据pityType创建计算器
- 计算器类型映射：hard→HardPityCalculator, soft→SoftPityCalculator
- 扩展机制：registerCalculator注册自定义计算器
- 统一接口：所有计算器继承BaseCalculator，统一calculate方法

**测试验证：**
```javascript
const CalculatorFactory = require('./core/calculator/calculator-factory');

// 创建硬保底计算器
const hardCalc = CalculatorFactory.createCalculator({ pityType: 'hard' });
// 输出: 创建计算器: {pityType: 'hard', calculatorType: 'HardPityCalculator'}

// 创建软保底计算器
const softCalc = CalculatorFactory.createCalculator({ pityType: 'soft' });
// 输出: 创建计算器: {pityType: 'soft', calculatorType: 'SoftPityCalculator'}

// 获取支持的类型
const types = CalculatorFactory.getSupportedTypes();
// 输出: ['hard', 'soft', 'no', 'base']
```

**文件清单：**
- core/calculator/calculator-factory.js (创建) - 计算器工厂

## Story

As a 系统,
I want 根据游戏类型自动创建对应的计算器,
so that 支持不同保底机制的游戏.

## Acceptance Criteria

1. **Given** 硬保底和软保底策略已实现
   **When** 实现calculator-factory.js
   **Then** 工厂根据游戏配置pityType创建计算器
   **And** pityType="hard"返回HardPityCalculator
   **And** pityType="soft"返回SoftPityCalculator
   **And** 支持扩展新的保底类型
   **And** 返回统一的计算器接口

## Tasks / Subtasks

- [x] **Task 1: 创建计算器工厂类** (AC: 1)
  - [x] 1.1 创建core/calculator/calculator-factory.js文件
  - [x] 1.2 定义createCalculator静态方法
  - [x] 1.3 根据pityType参数创建对应计算器
  - [x] 1.4 引入HardPityCalculator和SoftPityCalculator
  - [x] 1.5 引入BaseCalculator作为默认

- [x] **Task 2: 实现工厂创建逻辑** (AC: 1)
  - [x] 2.1 pityType="hard"返回HardPityCalculator实例
  - [x] 2.2 pityType="soft"返回SoftPityCalculator实例
  - [x] 2.3 其他类型返回BaseCalculator实例
  - [x] 2.4 支持无保底类型（no或undefined）
  - [x] 2.5 Console输出创建日志

- [x] **Task 3: 实现统一接口** (AC: 1)
  - [x] 3.1 所有计算器继承BaseCalculator
  - [x] 3.2 统一calculate方法接口
  - [x] 3.3 统一参数结构（resources, target, config）
  - [x] 3.4 统一返回结构（Result对象）
  - [x] 3.5 验证不同计算器接口一致

- [x] **Task 4: 支持扩展性** (AC: 1)
  - [x] 4.1 工厂支持注册新的保底类型
  - [x] 4.2 提供registerCalculator方法
  - [x] 4.3 支持自定义计算器类
  - [x] 4.4 验证扩展机制可用
  - [x] 4.5 Console输出注册日志

- [x] **Task 5: 验证工厂功能** (AC: 1)
  - [x] 5.1 测试创建硬保底计算器
  - [x] 5.2 测试创建软保底计算器
  - [x] 5.3 测试创建基础计算器
  - [x] 5.4 测试扩展机制
  - [x] 5.5 Console输出完整测试结果

## Dev Notes

### 关键技术决策

**工厂模式：**
- CalculatorFactory根据pityType创建计算器
- 统一创建接口，隐藏具体实现
- 易于扩展新的保底机制

**计算器类型映射：**
- pityType="hard" → HardPityCalculator
- pityType="soft" → SoftPityCalculator
- pityType="no"或undefined → BaseCalculator

**扩展机制：**
- 提供registerCalculator方法注册新类型
- 支持自定义计算器类
- 无需修改工厂代码即可扩展

### 计算器工厂设计

**core/calculator/calculator-factory.js：**

```javascript
// core/calculator/calculator-factory.js
// 计算器工厂

const BaseCalculator = require('./base-calculator');
const HardPityCalculator = require('./hard-pity');
const SoftPityCalculator = require('./soft-pity');

/**
 * 计算器工厂类
 * 根据游戏配置创建对应的计算器
 */
class CalculatorFactory {
  // 计算器类型映射
  static calculators = {
    'hard': HardPityCalculator,
    'soft': SoftPityCalculator,
    'no': BaseCalculator,
    'base': BaseCalculator
  };

  /**
   * 创建计算器
   * @param {Object} config - 游戏配置
   * @returns {Object} 计算器实例
   */
  static createCalculator(config) {
    const { pityType } = config;

    const CalculatorClass = this.calculators[pityType] || BaseCalculator;

    console.log('创建计算器:', {
      pityType,
      calculatorType: CalculatorClass.name
    });

    return new CalculatorClass();
  }

  /**
   * 注册新的计算器类型
   * @param {string} pityType - 保底类型
   * @param {Class} CalculatorClass - 计算器类
   */
  static registerCalculator(pityType, CalculatorClass) {
    this.calculators[pityType] = CalculatorClass;

    console.log('注册计算器:', {
      pityType,
      calculatorType: CalculatorClass.name
    });
  }

  /**
   * 获取支持的保底类型列表
   * @returns {Array} 保底类型列表
   */
  static getSupportedTypes() {
    return Object.keys(this.calculators);
  }
}

module.exports = CalculatorFactory;
```

### 使用示例

**创建计算器：**

```javascript
const CalculatorFactory = require('./core/calculator/calculator-factory');

// 创建硬保底计算器
const hardConfig = { pityType: 'hard', baseRate: 0.006, hardPity: 90 };
const hardCalc = CalculatorFactory.createCalculator(hardConfig);

// 创建软保底计算器
const softConfig = { pityType: 'soft', baseRate: 0.02, softPityStart: 50 };
const softCalc = CalculatorFactory.createCalculator(softConfig);

// 创建基础计算器
const baseConfig = { pityType: 'no', baseRate: 0.01 };
const baseCalc = CalculatorFactory.createCalculator(baseConfig);
```

**注册自定义计算器：**

```javascript
// 自定义计算器类
class CustomPityCalculator extends BaseCalculator {
  // ... 自定义实现
}

// 注册到工厂
CalculatorFactory.registerCalculator('custom', CustomPityCalculator);

// 使用自定义计算器
const customConfig = { pityType: 'custom' };
const customCalc = CalculatorFactory.createCalculator(customConfig);
```

### 测试验证

**验证工厂创建：**
- [ ] hard类型创建HardPityCalculator
- [ ] soft类型创建SoftPityCalculator
- [ ] no类型创建BaseCalculator
- [ ] 未知类型默认BaseCalculator

**验证统一接口：**
- [ ] 所有计算器有calculate方法
- [ ] 参数结构一致
- [ ] 返回结构一致

**验证扩展机制：**
- [ ] 注册新类型成功
- [ ] 创建自定义计算器成功

### References

- [Source: architecture.md#计算器工厂]
- [Source: architecture.md#计算引擎抽象]
- [Source: epics.md#Story 2.4]

### File List

已创建的文件：
- core/calculator/calculator-factory.js (创建) - 计算器工厂