# 多池联动计算器提案

## 概述

实现阴阳师等多池保底共享机制的计算器，支持跨池保底计数继承、多池综合概率计算、以及最优抽取策略建议。

## 动机

阴阳师的抽卡系统具有独特的"多池联动"特性：
- 多个卡池共享同一个保底计数
- 保底进度可以跨池继承
- 活动期间不同卡池概率 UP 不同

用户需要知道：
- 当前保底进度在哪个池抽取最划算
- 跨池继承后如何最优分配资源
- 多个目标式神的综合获取概率

## 目标用户

- 阴阳师玩家，特别是多池活动期间
- 需要规划勾玉资源的用户
- 追求最优抽取策略的玩家

## 用户故事

### Story 1: 多池保底状态记录

作为用户，我希望记录所有相关卡池的保底进度，以便统一管理。

**验收标准**：
- 可以添加多个关联卡池
- 显示共享的保底计数
- 标记每个池的 UP 内容

### Story 2: 跨池继承计算

作为用户，我希望了解保底进度如何在池之间继承，以便决定抽取顺序。

**验收标准**：
- 显示当前保底计数在各池的状态
- 计算在不同池抽取的期望差异
- 提供最优抽取顺序建议

### Story 3: 综合概率计算

作为用户，我希望看到多池联动的综合概率，以便评估总体资源需求。

**验收标准**：
- 显示多池综合获取概率
- 对比单池 vs 多池策略差异
- 可视化展示概率分布

### Story 4: 活动期策略

作为用户，我希望在活动期间获得最优策略，以便最大化概率 UP 收益。

**验收标准**：
- 输入活动时间范围
- 计算活动期最优抽取计划
- 提醒活动结束时间

## 范围

### 包含内容

- 多池保底共享机制计算引擎
- 跨池继承状态管理
- 多池综合概率计算
- 最优策略建议生成

### 不包含内容

- 其他游戏的多池机制（可扩展）
- 实时同步游戏活动数据

## 功能需求

### FR-1: 多池计算器核心

| 优先级 | 描述 |
|--------|------|
| P0 | 实现 `MultiPoolCalculator` 类，继承 `BaseCalculator` |
| P0 | 支持多池状态管理（共享保底计数） |
| P0 | 计算跨池继承后的概率分布 |
| P0 | 支持多池综合概率计算 |
| P1 | 生成最优抽取策略建议 |

### FR-2: 配置支持

| 优先级 | 描述 |
|--------|------|
| P0 | 在 `calculator-factory.js` 注册 `multi-pool` 类型 |
| P0 | 新增 `config/games/onmyoji-multi-pool.js` 配置 |
| P0 | 配置验证规则支持多池参数 |
| P1 | 支持动态添加/移除卡池 |

### FR-3: UI 展示

| 优先级 | 描述 |
|--------|------|
| P0 | 规划页新增多池管理界面 |
| P0 | 显示各池 UP 内容和概率 |
| P0 | 显示共享保底计数 |
| P1 | 最优策略建议展示 |
| P1 | 多池概率对比图表 |

## 非功能需求

- **性能**：多池计算响应时间 < 200ms
- **准确性**：模拟 100 万次误差 < 1%
- **扩展性**：支持最多 5 个关联卡池
- **兼容性**：与现有配置系统兼容

## 技术设计

### 核心算法

```javascript
class MultiPoolCalculator extends BaseCalculator {
  /**
   * 多池状态管理
   */
  constructor(pools, sharedPityCount, config) {
    super();
    this.pools = pools;           // [{poolId, name, upRate, upItems}]
    this.sharedPityCount = sharedPityCount;  // 共享保底计数
    this.config = config;
  }

  /**
   * 计算单池概率
   */
  calculateSinglePoolProbability(poolIndex, pityCount) {
    const pool = this.pools[poolIndex];
    const baseRate = this.config.baseRate;
    const upRate = pool.upRate;
    
    // 硬保底 400 抽
    if (pityCount >= 400) return 1.0;
    
    // 基础概率 + UP 加成
    return baseRate * upRate;
  }

  /**
   * 计算多池综合概率
   * 考虑保底共享和跨池继承
   */
  calculateCombinedProbability(resources, target, config) {
    const { pools, sharedPityCount } = this;
    const combined = [];
    
    // 为每个池计算概率分布
    pools.forEach((pool, index) => {
      const distribution = this.calculateDistributionForPool(index, sharedPityCount);
      combined.push({
        poolId: pool.poolId,
        name: pool.name,
        upItems: pool.upItems,
        distribution
      });
    });
    
    // 计算最优策略
    const optimalStrategy = this.findOptimalStrategy(combined);
    
    return {
      pools: combined,
      optimalStrategy,
      sharedPityCount
    };
  }

  /**
   * 寻找最优抽取策略
   * 返回期望值最小的池
   */
  findOptimalStrategy(poolDistributions) {
    const expectedValues = poolDistributions.map((dist, index) => {
      const ev = this.calculateExpectedValue(dist.distribution);
      return {
        poolIndex: index,
        expectedValue: ev,
        poolName: dist.name
      };
    });
    
    return expectedValues.sort((a, b) => a.expectedValue - b.expectedValue);
  }
}
```

### 配置结构

```json
{
  "gameId": "onmyoji",
  "name": "阴阳师",
  "pityType": "multi-pool",
  "baseRate": 0.01,
  
  "hardPity": {
    "enabled": true,
    "count": 400,
    "sharedAcrossPools": true
  },
  
  "pools": [
    {
      "poolId": "sp-event-2026-04",
      "name": "SP 式神召唤",
      "upRate": 2.0,
      "upItems": ["SP 式神 A"],
      "startDate": "2026-04-15",
      "endDate": "2026-04-29"
    },
    {
      "poolId": "ssr-event-2026-04",
      "name": "SSR 式神召唤",
      "upRate": 1.5,
      "upItems": ["SSR 式神 B"],
      "startDate": "2026-04-15",
      "endDate": "2026-04-29"
    }
  ],
  
  "pityInheritance": {
    "enabled": true,
    "crossPool": true,
    "description": "保底计数在所有卡池间共享"
  }
}
```

### 文件结构

```
openspec/changes/multi-pool-calculator/
├── proposal.md           # 本文件
├── design.md             # 详细设计
├── tasks.md              # 任务分解
└── specs/
    └── multi-pool-calculator/
        └── spec.md       # 功能规格
```

## 依赖关系

- 依赖现有的 `BaseCalculator` 基类
- 依赖现有的配置验证系统
- 依赖现有的 UI 组件库
- 与幸运值计算器无依赖关系

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 多池规则复杂 | 用户理解困难 | 提供清晰的引导和说明 |
| 活动规则变更 | 计算失效 | 设计可配置的池规则 |
| 计算复杂度高 | 性能问题 | 优化算法，使用缓存 |

## 成功指标

- 计算器计算结果与社区公认数据误差 < 5%
- 用户可以在规划页完整记录阴阳师多池状态
- 测试覆盖率 > 90%
- 最优策略建议被用户采纳 > 70%

## 验收标准

1. 创建 `MultiPoolCalculator` 类并通过单元测试
2. 在规划页可以管理多个关联卡池
3. 正确计算跨池继承后的概率
4. 生成最优抽取策略建议
5. 与现有游戏配置系统无缝集成

---

**创建日期**：2026-04-22  
**状态**：Proposed  
**优先级**：P1
