# 幸运值计算器提案

## 概述

实现王者荣耀幸运值机制的计算器，支持幸运值累积、积分夺宝概率计算、以及达到目标所需的资源规划。

## 动机

王者荣耀的积分夺宝采用独特的"幸运值"机制：
- 每次抽奖失败会增加幸运值
- 幸运值达到上限（361）时必定获得荣耀水晶
- 当前计算器无法模拟这种"失败累积"机制

用户需要知道：
- 当前幸运值下，期望多少次能获得水晶
- 需要准备多少荣耀积分
- 不同幸运值区间的概率分布

## 目标用户

- 王者荣耀玩家，特别是积分夺宝用户
- 需要规划荣耀积分资源的用户

## 用户故事

### Story 1: 幸运值状态记录

作为用户，我希望记录当前的幸运值，以便计算还需要多少次能抽到水晶。

**验收标准**：
- 可以输入当前幸运值（0-360）
- 显示距离保底还差多少次
- 显示期望抽数和资源需求

### Story 2: 概率模拟

作为用户，我希望看到不同幸运值下的概率分布，以便评估抽奖时机。

**验收标准**：
- 显示从当前幸运值到 361 的概率曲线
- 显示期望值、P50、P90、P99 等统计指标
- 可视化展示概率分布

### Story 3: 资源规划

作为用户，我希望知道达到目标需要多少积分，以便决定何时抽取。

**验收标准**：
- 输入当前积分和每日收入
- 计算达到目标所需的时长
- 提供最优抽取策略建议

## 范围

### 包含内容

- 幸运值机制的概率计算引擎
- 幸运值输入界面（规划页新增）
- 概率分布可视化
- 资源需求计算

### 不包含内容

- 王者荣耀其他抽卡机制（如钻石夺宝）
- 实时同步游戏数据

## 功能需求

### FR-1: 幸运值计算器核心

| 优先级 | 描述 |
|--------|------|
| P0 | 实现 `LuckValueCalculator` 类，继承 `BaseCalculator` |
| P0 | 支持幸运值状态管理（0-360） |
| P0 | 计算从任意幸运值到 361 的概率分布 |
| P1 | 支持幸运值重置（抽到水晶后） |

### FR-2: 配置支持

| 优先级 | 描述 |
|--------|------|
| P0 | 在 `calculator-factory.js` 注册 `luck` 类型 |
| P0 | 新增 `config/games/hok-luck.js` 配置 |
| P1 | 配置验证规则支持幸运值参数 |

### FR-3: UI 展示

| 优先级 | 描述 |
|--------|------|
| P0 | 规划页新增幸运值输入框 |
| P0 | 显示当前幸运值和距离保底次数 |
| P1 | 概率分布图表展示 |

## 非功能需求

- **性能**：概率计算响应时间 < 100ms
- **准确性**：模拟 100 万次误差 < 1%
- **兼容性**：与现有配置系统兼容

## 技术设计

### 核心算法

```javascript
class LuckValueCalculator extends BaseCalculator {
  /**
   * 计算单抽概率
   * @param {number} currentLuck - 当前幸运值 (0-360)
   * @param {number} baseRate - 基础概率 (~0.5%)
   * @returns {number} 本抽概率
   */
  calculateSingleProbability(currentLuck, baseRate) {
    if (currentLuck >= 360) return 1.0; // 361 抽必中
    return baseRate;
  }

  /**
   * 计算概率分布
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { currentLuck } = resources;
    const { baseRate } = config;
    const distribution = [];
    let cumulativeFail = 1.0;

    for (let i = 0; i < (361 - currentLuck); i++) {
      const pull = currentLuck + i + 1;
      const singleProb = this.calculateSingleProbability(pull - 1, baseRate);
      cumulativeFail *= (1 - singleProb);
      
      distribution.push({
        pull: i + 1,
        absolutePull: pull,
        singleProbability: singleProb,
        cumulativeProbability: 1 - cumulativeFail,
        luckValue: pull - 1
      });
    }

    return distribution;
  }
}
```

### 文件结构

```
openspec/changes/luck-value-calculator/
├── proposal.md           # 本文件
├── design.md             # 详细设计
├── tasks.md              # 任务分解
└── specs/
    └── luck-calculator/
        └── spec.md       # 功能规格
```

## 依赖关系

- 依赖现有的 `BaseCalculator` 基类
- 依赖现有的配置验证系统
- 依赖现有的 UI 组件库

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 基础概率不准确 | 计算结果偏差 | 提供可配置的基础概率参数 |
| 幸运值机制变更 | 计算失效 | 设计可配置的上限和规则 |

## 成功指标

- 计算器计算结果与社区公认数据误差 < 5%
- 用户可以在规划页完整记录王者荣耀抽卡状态
- 测试覆盖率 > 90%

## 验收标准

1. 创建 `LuckValueCalculator` 类并通过单元测试
2. 在规划页可以输入和保存幸运值
3. 概率分布图表正确显示
4. 与现有游戏配置系统无缝集成

---

**创建日期**：2026-04-22  
**状态**：Proposed  
**优先级**：P1
