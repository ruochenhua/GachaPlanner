# Story 5.3: 无保底策略实现

Status: ready-for-dev

## Story

As a 系统,
I want 实现无保底策略,
So that 支持无保底机制的游戏（如FGO）.

## Acceptance Criteria

**Given** 计算器工厂已实现
**When** 实现no-pity.js策略
**Then** 策略计算纯概率模型（无保底）
**And** 每抽概率固定为基础概率
**And** 支持配置基础概率参数
**And** 计算准确度 > 95%
**And** 工厂支持pityType="none"创建计算器

## Tasks / Subtasks

- [ ] **Task 1: 创建无保底计算器** (AC: 1, 2)
  - [ ] 1.1 创建core/calculator/no-pity.js
  - [ ] 1.2 实现NoPityCalculator类
  - [ ] 1.3 继承BaseCalculator基类
  - [ ] 1.4 实现calculate()方法
  - [ ] 1.5 导出计算器模块

- [ ] **Task 2: 实现纯概率计算** (AC: 2, 3)
  - [ ] 2.1 每抽概率固定为基础概率
  - [ ] 2.2 无保底触发机制
  - [ ] 2.3 计算N抽累计概率
  - [ ] 2.4 计算概率分布数组
  - [ ] 2.5 处理大抽数情况（概率趋近1）

- [ ] **Task 3: 实现可配置参数** (AC: 3)
  - [ ] 3.1 支持配置基础概率
  - [ ] 3.2 支持配置UP概率（如有）
  - [ ] 3.3 参数验证
  - [ ] 3.4 参数缺失时使用默认值
  - [ ] 3.5 参数范围检查

- [ ] **Task 4: 集成到计算器工厂** (AC: 5)
  - [ ] 4.1 更新calculator-factory.js
  - [ ] 4.2 支持pityType="none"
  - [ ] 4.3 返回NoPityCalculator实例
  - [ ] 4.4 工厂单元测试更新
  - [ ] 4.5 确保工厂扩展性

- [ ] **Task 5: 计算准确度验证** (AC: 4)
  - [ ] 5.1 数学公式验证
  - [ ] 5.2 边界条件测试（大抽数）
  - [ ] 5.3 与硬保底对比测试
  - [ ] 5.4 与软保底对比测试
  - [ ] 5.5 确保准确度 > 95%

- [ ] **Task 6: 集成测试** (AC: 1-5)
  - [ ] 6.1 测试无保底计算
  - [ ] 6.2 测试工厂创建
  - [ ] 6.3 测试参数配置
  - [ ] 6.4 测试概率分布
  - [ ] 6.5 测试准确度

## Dev Notes

无保底策略实现，用于支持无保底机制的游戏（如FGO、碧蓝航线等）。

### 数学公式

无保底机制的累计概率计算：

```
P(n) = 1 - (1 - p)^n

其中：
- P(n): n抽累计成功率
- p: 单抽基础概率
- n: 抽数
```

概率分布数组：

```javascript
function calculateDistribution(baseRate, maxPulls) {
  const distribution = [];
  for (let n = 1; n <= maxPulls; n++) {
    const cumulativeProbability = 1 - Math.pow(1 - baseRate, n);
    distribution.push({
      pulls: n,
      probability: cumulativeProbability * 100
    });
  }
  return distribution;
}
```

### FGO示例参数

```javascript
{
  gameId: "fgo",
  name: "命运-冠位指定",
  pityType: "none",
  baseRate: 0.01,    // 1%基础概率
  resources: {
    primary: {
      id: "quartz",
      name: "圣晶石",
      convertRate: 3  // 3圣晶石=1抽
    }
  }
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- core/calculator/no-pity.js (新建) - 无保底计算器
- core/calculator/calculator-factory.js (更新) - 注册none类型