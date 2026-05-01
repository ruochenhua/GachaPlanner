# 多池联动计算器 - 详细设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      规划页 (UI Layer)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  多池管理                                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │ 池 1: SP 池  │  │ 池 2: SSR 池 │  │ 池 3: 混合池 │  │    │
│  │  │ UP: 式神 A  │  │ UP: 式神 B  │  │ UP: 式神 C  │  │    │
│  │  │ 概率：2.0%  │  │ 概率：1.5%  │  │ 概率：1.0%  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  │                                                     │    │
│  │  共享保底计数：150/400                               │    │
│  │  最优策略：建议在池 1 抽取（期望值最低）               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PlanningStorage (数据持久化服务)                     │    │
│  │  - savePlanningData()                               │    │
│  │  - loadPlanningData()                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Core Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ MultiPool       │  │ Calculator      │                  │
│  │ Calculator      │◀─│ Factory         │                  │
│  │                 │  │                 │                  │
│  │ - addPool()     │  │ - createCalculator│              │
│  │ - removePool()  │  │ - registerCalculator│              │
│  │ - calculate     │  └─────────────────┘                  │
│  │   CombinedProb  │                                       │
│  │ - findOptimal   │                                       │
│  │   Strategy      │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Config Layer                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  config/games/onmyoji-multi-pool.js (阴阳师配置)     │    │
│  │  - pools: [...]                                     │    │
│  │  - sharedPityCount: 400                             │    │
│  │  - pityInheritance: { crossPool: true }             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
用户添加/管理卡池
      ↓
onPoolChange(e)
      ↓
setData({ pools: [...], sharedPityCount: value })
      ↓
PlanningStorage.savePlanningData() ← 自动保存
      ↓
MultiPoolCalculator.calculateCombinedProbability()
      ↓
生成最优策略建议
      ↓
更新 UI 显示
```

## 组件设计

### 1. 多池管理界面

```
┌─────────────────────────────────────────────┐
│  多池管理                          [+ 添加] │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │ SP 式神召唤池                    [编辑]│ │
│  │ UP: SP 式神 A  | 概率：2.0%            │ │
│  │ 活动期：04/15 - 04/29                │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ SSR 式神召唤池                   [编辑]│ │
│  │ UP: SSR 式神 B  | 概率：1.5%           │ │
│  │ 活动期：04/15 - 04/29                │ │
│  └───────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  共享保底计数：150 / 400                    │
│  ██████████░░░░░░░░░░░░░ 37.5%             │
├─────────────────────────────────────────────┤
│  最优策略建议                               │
│  💡 建议在「SP 式神召唤池」抽取              │
│  理由：UP 概率最高，期望抽数最少             │
└─────────────────────────────────────────────┘
```

### 2. 概率对比图表

```
各池概率对比
  2.0% │  ╭───╮
       │  │   │
  1.5% │  │   ╰───╮
       │  │       │
  1.0% │  │       ╰───╮
       │  │           │
  0.0% └──┴───────────┴────
       SP 池    SSR 池   混合池
```

## 类设计

### MultiPoolCalculator

```javascript
/**
 * 多池联动计算器
 * 用于计算阴阳师等多池共享保底机制的概率
 */
class MultiPoolCalculator extends BaseCalculator {
  /**
   * 构造函数
   * @param {Array} pools - 卡池配置数组
   * @param {number} sharedPityCount - 共享保底计数
   * @param {Object} config - 游戏配置
   */
  constructor(pools, sharedPityCount, config) {
    super();
    this.pools = pools;
    this.sharedPityCount = sharedPityCount;
    this.config = config;
  }

  /**
   * 计算单池概率
   * @param {number} poolIndex - 池索引
   * @param {number} pityCount - 当前保底计数
   * @returns {number} 单抽概率
   */
  calculateSinglePoolProbability(poolIndex, pityCount) {
    const pool = this.pools[poolIndex];
    const { baseRate } = this.config;
    const { upRate = 1.0 } = pool;
    
    // 硬保底 400 抽必中
    if (pityCount >= 400) {
      return 1.0;
    }
    
    // 基础概率 * UP 倍率
    return baseRate * upRate;
  }

  /**
   * 计算单池概率分布
   * @param {number} poolIndex - 池索引
   * @param {number} startPity - 起始保底计数
   * @returns {Array} 概率分布数组
   */
  calculateDistributionForPool(poolIndex, startPity) {
    const distribution = [];
    let cumulativeFail = 1.0;
    const maxPulls = 400 - startPity;

    for (let i = 0; i < maxPulls; i++) {
      const currentPity = startPity + i;
      const singleProb = this.calculateSinglePoolProbability(poolIndex, currentPity);
      cumulativeFail *= (1 - singleProb);
      const cumulativeProb = 1 - cumulativeFail;

      distribution.push({
        pull: i + 1,
        absolutePity: currentPity + 1,
        singleProbability: singleProb,
        cumulativeProbability: cumulativeProb
      });
    }

    return distribution;
  }

  /**
   * 计算多池综合概率
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Object} 综合概率结果
   */
  calculateCombinedProbability(resources, target, config) {
    const { pools, sharedPityCount } = this;
    const result = {
      pools: [],
      sharedPityCount,
      optimalStrategy: null
    };

    // 为每个池计算概率分布
    pools.forEach((pool, index) => {
      const distribution = this.calculateDistributionForPool(index, sharedPityCount);
      const expectedValue = this.calculateExpectedValue(distribution);
      
      result.pools.push({
        poolId: pool.poolId,
        name: pool.name,
        upItems: pool.upItems,
        upRate: pool.upRate,
        distribution,
        expectedValue,
        statistics: this.calculateStatistics(distribution)
      });
    });

    // 计算最优策略
    result.optimalStrategy = this.findOptimalStrategy(result.pools);

    return result;
  }

  /**
   * 计算期望值
   * @param {Array} distribution - 概率分布
   * @returns {number} 期望抽数
   */
  calculateExpectedValue(distribution) {
    let ev = 0;
    let prevCumulative = 0;
    
    for (const item of distribution) {
      const prob = item.cumulativeProbability - prevCumulative;
      ev += item.pull * prob;
      prevCumulative = item.cumulativeProbability;
    }
    
    return ev;
  }

  /**
   * 计算统计指标
   * @param {Array} distribution - 概率分布
   * @returns {Object} 统计指标
   */
  calculateStatistics(distribution) {
    const findPercentile = (target) => {
      const item = distribution.find(d => d.cumulativeProbability >= target);
      return item ? item.pull : distribution.length;
    };

    return {
      expectedValue: Math.round(this.calculateExpectedValue(distribution) * 100) / 100,
      P50: findPercentile(0.5),
      P90: findPercentile(0.9),
      P99: findPercentile(0.99),
      maxPulls: distribution.length
    };
  }

  /**
   * 寻找最优策略
   * @param {Array} poolResults - 各池计算结果
   * @returns {Object} 最优策略
   */
  findOptimalStrategy(poolResults) {
    const sorted = [...poolResults].sort(
      (a, b) => a.expectedValue - b.expectedValue
    );

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    return {
      recommendedPoolId: best.poolId,
      recommendedPoolName: best.name,
      reason: `期望抽数最少 (${best.expectedValue.toFixed(1)} 抽)`,
      expectedValue: best.expectedValue,
      allPoolsRanked: sorted.map(p => ({
        poolId: p.poolId,
        name: p.name,
        expectedValue: p.expectedValue
      })),
      savings: {
        vsWorst: worst.expectedValue - best.expectedValue,
        percentBetter: ((worst.expectedValue - best.expectedValue) / worst.expectedValue * 100).toFixed(1) + '%'
      }
    };
  }

  /**
   * 添加卡池
   * @param {Object} poolConfig - 池配置
   */
  addPool(poolConfig) {
    this.pools.push(poolConfig);
  }

  /**
   * 移除卡池
   * @param {string} poolId - 池 ID
   */
  removePool(poolId) {
    this.pools = this.pools.filter(p => p.poolId !== poolId);
  }
}

module.exports = MultiPoolCalculator;
```

### 配置示例

```javascript
// config/games/onmyoji-multi-pool.js
module.exports = {
  gameId: 'onmyoji',
  name: '阴阳师',
  version: '1.0.0',
  updatedAt: '2026-04-22',
  
  pityType: 'multi-pool',
  baseRate: 0.01,  // 1% 基础概率
  
  hardPity: {
    enabled: true,
    count: 400,
    sharedAcrossPools: true
  },
  
  pools: [
    {
      poolId: 'sp-event-2026-04',
      name: 'SP 式神召唤',
      upRate: 2.0,
      upItems: ['SP 式神 A'],
      startDate: '2026-04-15',
      endDate: '2026-04-29'
    },
    {
      poolId: 'ssr-event-2026-04',
      name: 'SSR 式神召唤',
      upRate: 1.5,
      upItems: ['SSR 式神 B'],
      startDate: '2026-04-15',
      endDate: '2026-04-29'
    }
  ],
  
  pityInheritance: {
    enabled: true,
    crossPool: true,
    description: '保底计数在所有卡池间共享'
  },
  
  resources: {
    hook: {
      name: '勾玉',
      icon: '/assets/images/games/onmyoji-hook.png'
    }
  },
  
  conversionRate: {
    hookToPull: 100  // 100 勾玉 = 1 次抽奖
  }
};
```

## 接口规范

### 输入参数

| 参数 | 类型 | 说明 |
|------|------|------|
| pools | Array | 卡池配置数组 |
| sharedPityCount | number | 共享保底计数 |
| baseRate | number | 基础概率 |

### 输出结果

| 字段 | 类型 | 说明 |
|------|------|------|
| pools | Array | 各池计算结果 |
| sharedPityCount | number | 共享保底计数 |
| optimalStrategy | Object | 最优策略建议 |

## 测试策略

### 单元测试

```javascript
// tests/core/calculator/multi-pool-calculator.test.js

describe('MultiPoolCalculator', () => {
  test('单池概率计算正确', () => {
    const calc = new MultiPoolCalculator(
      [{ poolId: 'p1', name: '池 1', upRate: 2.0 }],
      0,
      { baseRate: 0.01 }
    );
    const prob = calc.calculateSinglePoolProbability(0, 0);
    expect(prob).toBe(0.02); // 0.01 * 2.0
  });

  test('400 抽必中', () => {
    const calc = new MultiPoolCalculator(
      [{ poolId: 'p1', name: '池 1', upRate: 1.0 }],
      399,
      { baseRate: 0.01 }
    );
    const prob = calc.calculateSinglePoolProbability(0, 399);
    expect(prob).toBe(1.0);
  });

  test('最优策略选择正确', () => {
    const calc = new MultiPoolCalculator(
      [
        { poolId: 'p1', name: '高 UP 池', upRate: 2.0 },
        { poolId: 'p2', name: '低 UP 池', upRate: 1.0 }
      ],
      0,
      { baseRate: 0.01 }
    );
    const result = calc.calculateCombinedProbability({}, {}, {});
    expect(result.optimalStrategy.recommendedPoolId).toBe('p1');
  });
});
```

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `core/calculator/multi-pool-calculator.js` | 新增 | 多池计算器核心 |
| `config/games/onmyoji-multi-pool.js` | 新增 | 阴阳师配置 |
| `pages/planning/planning.wxml` | 修改 | 添加多池管理 UI |
| `pages/planning/planning.js` | 修改 | 添加多池处理逻辑 |
| `pages/planning/planning.wxss` | 修改 | 多池管理样式 |
| `tests/core/calculator/multi-pool-calculator.test.js` | 新增 | 单元测试 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22  
**版本**：1.0
