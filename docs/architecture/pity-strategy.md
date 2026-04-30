# 保底策略指南

本文档说明如何实现新的保底策略。

## 现有保底策略

| 策略 | 说明 | 适用游戏 |
|------|------|----------|
| `hard` | 硬保底 | 原神、星铁 |
| `soft` | 软保底 | 明日方舟 |
| `none` | 无保底 | FGO、碧蓝航线 |

## 策略接口规范

所有保底策略必须继承 `BaseCalculator` 基类，并实现以下方法：

```javascript
class CustomPityCalculator extends BaseCalculator {
  /**
   * 计算概率分布
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    // 实现概率分布计算逻辑
  }

  /**
   * 计算单抽概率
   * @param {number} pull - 当前抽数
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    // 实现单抽概率计算逻辑
  }
}
```

## 实现新策略的步骤

### 1. 创建策略文件

在 `core/calculator/` 目录下创建新的策略文件：

```javascript
// core/calculator/custom-pity.js

const BaseCalculator = require('./base-calculator');

class CustomPityCalculator extends BaseCalculator {
  calculateProbabilityDistribution(resources, target, config) {
    // 实现自定义概率计算逻辑
    const distribution = [];
    // ...
    return distribution;
  }

  calculateSingleProbability(pull, baseRate, config) {
    // 实现自定义单抽概率逻辑
    return probability;
  }
}

module.exports = CustomPityCalculator;
```

### 2. 注册到工厂

在 `calculator-factory.js` 中注册新策略：

```javascript
const CustomPityCalculator = require('./custom-pity');

class CalculatorFactory {
  static calculators = {
    'hard': HardPityCalculator,
    'soft': SoftPityCalculator,
    'none': NoPityCalculator,
    'custom': CustomPityCalculator  // 新增
  };
}
```

### 3. 添加配置验证

在 `config-validator.js` 中添加新策略的验证规则：

```javascript
if (config.pityType === 'custom') {
  // 验证自定义策略的必填参数
}
```

### 4. 编写测试

为新策略编写单元测试，确保计算准确度 > 95%。

## 数学公式参考

### 硬保底

```
P(n) = 1                                    (n >= hardPity)
P(n) = 1 - (1 - p)^(n-1) * (1 - p_n)        (n < hardPity)

其中 p_n 为第 n 抽的概率（考虑软保底）
```

### 软保底

```
p_n = p + (n - softPityStart + 1) * increment    (n >= softPityStart)
p_n = p                                          (n < softPityStart)
```

### 无保底

```
P(n) = 1 - (1 - p)^n
```

## 示例：实现"递增概率"策略

```javascript
class IncrementalPityCalculator extends BaseCalculator {
  calculateSingleProbability(pull, baseRate, config) {
    const { incrementStart, incrementRate } = config;
    
    if (pull < incrementStart) {
      return baseRate;
    }
    
    // 从 incrementStart 开始概率递增
    const increment = (pull - incrementStart + 1) * incrementRate;
    return Math.min(baseRate + increment, 1);
  }

  calculateProbabilityDistribution(resources, target, config) {
    const maxPulls = target.pulls || 100;
    const distribution = [];
    let cumulativeFail = 1; // 累积失败概率

    for (let pull = 1; pull <= maxPulls; pull++) {
      const singleProbability = this.calculateSingleProbability(pull, config.baseRate, config);
      cumulativeFail *= (1 - singleProbability);
      const cumulativeProbability = 1 - cumulativeFail;

      distribution.push({
        pull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * pull
      });
    }

    return distribution;
  }
}
```