# Story 2.3: 软保底策略实现

Status: done

## Story

As a 系统,
I want 实现软保底策略（明日方舟）,
so that 准确计算有软保底机制的概率.

## Acceptance Criteria

1. **Given** 基础计算器已实现
   **When** 实现soft-pity.js策略
   **Then** 策略可计算软保底概率渐进提升
   **And** 从指定抽数开始概率逐渐提升
   **And** 支持配置软保底起始抽数和提升速率
   **And** 计算准确度 > 95%

## Tasks / Subtasks

- [x] **Task 1: 创建软保底策略类** (AC: 1)
  - [x] 1.1 创建core/calculator/soft-pity.js文件
  - [x] 1.2 继承BaseCalculator类
  - [x] 1.3 重写calculateSingleProbability方法
  - [x] 1.4 实现软保底逻辑（概率渐进提升）
  - [x] 1.5 调用父类缓存和验证机制

- [x] **Task 2: 实现软保底概率计算** (AC: 1)
  - [x] 2.1 保底前概率固定为基础概率
  - [x] 2.2 软保底区间概率逐步提升
  - [x] 2.3 支持软保底起始参数（softPityStart）
  - [x] 2.4 支持提升速率参数（softPityIncrement）
  - [x] 2.5 验证概率渐进提升正确

- [x] **Task 3: 实现累积概率计算** (AC: 1)
  - [x] 3.1 计算每一抽的累积概率
  - [x] 3.2 考虑软保底机制的影响
  - [x] 3.3 生成概率分布数组
  - [x] 3.4 验证计算准确度 > 95%
  - [x] 3.5 Console输出测试结果

- [x] **Task 4: 支持保底继承** (AC: 1)
  - [x] 4.1 支持currentPity参数
  - [x] 4.2 计算时考虑已抽数
  - [x] 4.3 验证继承抽数正确计算
  - [x] 4.4 更新缓存键包含软保底参数
  - [x] 4.5 Console输出保底状态日志

- [x] **Task 5: 验证软保底策略** (AC: 1)
  - [x] 5.1 测试软保底起始正确
  - [x] 5.2 测试概率提升正确
  - [x] 5.3 测试保底继承正确
  - [x] 5.4 测试计算准确度
  - [x] 5.5 Console输出完整测试结果

## Dev Notes

### 关键技术决策

**软保底机制（明日方舟）：**
- 基础概率：2%（0.02）
- 软保底起始：第50抽开始
- 提升速率：每抽增加2%
- 第50抽：2% + 2% = 4%
- 第51抽：2% + 4% = 6%
- ...直到达到硬保底或触发

**概率提升公式：**
- 保底前（1-49抽）：p = baseRate
- 软保底区间（50+抽）：p = baseRate + (pull - softPityStart + 1) * softPityIncrement
- 限制：p ≤ 1.0

**累积概率计算：**
- 每一抽的概率不同
- 需要逐步累积计算
- 公式：P(n) = P(n-1) + (1-P(n-1)) * p(n)

### 软保底策略类设计

**core/calculator/soft-pity.js：**

```javascript
const BaseCalculator = require('./base-calculator');

class SoftPityCalculator extends BaseCalculator {
  calculateSingleProbability(pull, baseRate, config) {
    const { softPityStart, softPityIncrement } = config;

    // 软保底区间
    if (pull >= softPityStart) {
      const increment = (pull - softPityStart + 1) * softPityIncrement;
      return Math.min(baseRate + increment, 1.0);
    }

    // 保底前：基础概率
    return baseRate;
  }

  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate, softPityStart, softPityIncrement } = config;
    const maxPulls = target.pulls || 100;
    const currentPity = target.currentPity || 0;

    const distribution = [];
    let cumulativeProbability = 0;

    for (let i = 1; i <= maxPulls; i++) {
      const actualPull = currentPity + i;
      const singleProbability = this.calculateSingleProbability(actualPull, baseRate, config);

      // 累积概率计算
      cumulativeProbability = cumulativeProbability + (1 - cumulativeProbability) * singleProbability;

      distribution.push({
        pull: i,
        actualPull,
        singleProbability,
        cumulativeProbability,
        expectedValue: cumulativeProbability * i,
        isSoftPity: actualPull >= softPityStart
      });
    }

    return distribution;
  }
}

module.exports = SoftPityCalculator;
```

### 测试验证

**验证软保底机制：**
- 第49抽：p = 0.02
- 第50抽：p = 0.02 + 0.02 = 0.04
- 第51抽：p = 0.02 + 0.04 = 0.06
- 验证概率渐进提升正确

### References

- [Source: architecture.md#软保底策略]
- [Source: epics.md#Story 2.3]

### File List

已创建的文件：
- core/calculator/soft-pity.js (创建) - 软保底策略计算器