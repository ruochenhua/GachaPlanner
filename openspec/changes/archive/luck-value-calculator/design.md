# 幸运值计算器 - 详细设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      规划页 (UI Layer)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  幸运值输入框  │  当前概率显示  │  距离保底提示     │    │
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
│  │ LuckValue       │  │ Calculator      │                  │
│  │ Calculator      │◀─│ Factory         │                  │
│  │                 │  │                 │                  │
│  │ - calculate     │  │ - createCalculator()│              │
│  │   SingleProb    │  │ - registerCalculator│              │
│  │ - calculate     │  └─────────────────┘                  │
│  │   Distribution  │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Config Layer                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  config/games/hok-luck.js (王者荣耀配置)             │    │
│  │  - baseRate: 0.005                                  │    │
│  │  - luckValueMax: 361                                │    │
│  │  - pityType: 'luck'                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
用户输入幸运值
      ↓
onLuckValueChange(e)
      ↓
setData({ currentLuck: value })
      ↓
PlanningStorage.savePlanningData() ← 自动保存
      ↓
LuckValueCalculator.calculateDistribution()
      ↓
更新概率图表显示
```

## 组件设计

### 1. 幸运值输入组件

```
┌─────────────────────────────────────┐
│  当前幸运值                          │
│  ┌─────────────────────────────┐    │
│  │  [=====>            ] 240   │    │
│  │   0              360        │    │
│  └─────────────────────────────┘    │
│  距离保底还差：121 抽                │
│  当前单次概率：0.5%                  │
│  期望抽数：约 180 抽                  │
└─────────────────────────────────────┘
```

### 2. 概率分布图表

```
概率分布
  100% │                              ╭──
       │                           ╭──╯
   50% │                        ╭──╯
       │                     ╭──╯
    0% │─────────────────────╯──────────
       0    50   100   150   200   250   300
                        抽数
```

## 类设计

### LuckValueCalculator

```javascript
/**
 * 幸运值计算器
 * 用于计算王者荣耀积分夺宝等幸运值机制的概率
 */
class LuckValueCalculator extends BaseCalculator {
  /**
   * 计算单抽概率
   * @param {number} currentLuck - 当前幸运值 (0-360)
   * @param {Object} config - 游戏配置
   * @returns {number} 本抽概率 (0-1)
   */
  calculateSingleProbability(currentLuck, config) {
    const { baseRate, luckValueMax } = config;
    
    // 达到最大幸运值，必定成功
    if (currentLuck >= luckValueMax - 1) {
      return 1.0;
    }
    
    return baseRate;
  }

  /**
   * 计算概率分布
   * @param {Object} resources - 资源数据（包含 currentLuck）
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { currentLuck = 0 } = resources;
    const { luckValueMax } = config;
    const distribution = [];
    let cumulativeFail = 1.0;

    const remainingPulls = luckValueMax - currentLuck;

    for (let i = 0; i < remainingPulls; i++) {
      const pull = currentLuck + i + 1;
      const singleProb = this.calculateSingleProbability(
        currentLuck + i,
        config
      );
      cumulativeFail *= (1 - singleProb);
      const cumulativeProb = 1 - cumulativeFail;

      distribution.push({
        pull: i + 1,                    // 相对抽数
        absolutePull: pull,             // 绝对幸运值
        singleProbability: singleProb,  // 单抽概率
        cumulativeProbability: cumulativeProb, // 累积概率
        luckValue: currentLuck + i      // 对应幸运值
      });
    }

    return distribution;
  }

  /**
   * 计算期望抽数
   * @param {Array} distribution - 概率分布
   * @returns {number} 期望抽数
   */
  calculateExpectedValue(distribution) {
    let ev = 0;
    for (const item of distribution) {
      const prob = item.cumulativeProbability - 
                   (distribution[item.pull - 2]?.cumulativeProbability || 0);
      ev += item.pull * prob;
    }
    return ev;
  }

  /**
   * 计算统计指标
   * @param {Array} distribution - 概率分布
   * @returns {Object} 统计指标 { P50, P90, P99, expectedValue }
   */
  calculateStatistics(distribution) {
    const expectedValue = this.calculateExpectedValue(distribution);
    
    const findPercentile = (target) => {
      const item = distribution.find(d => d.cumulativeProbability >= target);
      return item ? item.pull : distribution.length;
    };

    return {
      expectedValue: Math.round(expectedValue * 100) / 100,
      P50: findPercentile(0.5),
      P90: findPercentile(0.9),
      P99: findPercentile(0.99),
      maxPulls: distribution.length
    };
  }
}

module.exports = LuckValueCalculator;
```

### 配置示例

```javascript
// config/games/hok-luck.js
module.exports = {
  gameId: 'hok',
  name: '王者荣耀',
  version: '1.0.0',
  updatedAt: '2026-04-22',
  
  pityType: 'luck',
  baseRate: 0.005,  // 0.5% 基础概率
  
  luckValue: {
    max: 361,           // 最大幸运值
    current: 0,         // 当前幸运值（用户可配置）
    resetOnSuccess: true // 成功后重置
  },
  
  resources: {
    points: {
      name: '积分',
      icon: '/assets/images/games/hok-points.png'
    }
  },
  
  conversionRate: {
    pointsToPull: 5  // 5 积分 = 1 次抽奖
  }
};
```

## 接口规范

### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentLuck | number | 是 | 当前幸运值 (0-360) |
| baseRate | number | 是 | 基础概率 |
| luckValueMax | number | 是 | 最大幸运值 |

### 输出结果

| 字段 | 类型 | 说明 |
|------|------|------|
| distribution | Array | 概率分布数组 |
| statistics | Object | 统计指标 |
| expectedValue | number | 期望抽数 |
| P50/P90/P99 | number | 百分位抽数 |

## 测试策略

### 单元测试

```javascript
// tests/core/calculator/luck-value-calculator.test.js

describe('LuckValueCalculator', () => {
  test('360 幸运值时下一抽必中', () => {
    const calc = new LuckValueCalculator();
    const prob = calc.calculateSingleProbability(360, { luckValueMax: 361 });
    expect(prob).toBe(1.0);
  });

  test('基础概率计算正确', () => {
    const calc = new LuckValueCalculator();
    const prob = calc.calculateSingleProbability(0, { baseRate: 0.005, luckValueMax: 361 });
    expect(prob).toBe(0.005);
  });

  test('期望抽数计算', () => {
    const calc = new LuckValueCalculator();
    const distribution = calc.calculateProbabilityDistribution(
      { currentLuck: 0 },
      {},
      { baseRate: 0.005, luckValueMax: 361 }
    );
    const stats = calc.calculateStatistics(distribution);
    expect(stats.expectedValue).toBeLessThan(361);
    expect(stats.expectedValue).toBeGreaterThan(100);
  });
});
```

### 集成测试

```javascript
// tests/integration/luck-value-integration.test.js

describe('幸运值计算器集成测试', () => {
  test('完整流程：输入→计算→显示', () => {
    // 模拟用户输入幸运值 240
    // 触发计算
    // 验证显示结果
  });
});
```

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `core/calculator/luck-value-calculator.js` | 新增 | 幸运值计算器核心 |
| `config/games/hok-luck.js` | 新增 | 王者荣耀配置 |
| `pages/planning/planning.wxml` | 修改 | 添加幸运值输入 |
| `pages/planning/planning.js` | 修改 | 添加幸运值处理逻辑 |
| `pages/planning/planning.wxss` | 修改 | 幸运值输入样式 |
| `tests/core/calculator/luck-value-calculator.test.js` | 新增 | 单元测试 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22  
**版本**：1.0
