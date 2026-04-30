---
title: '卡池时间范围设置与动态概率预测'
type: 'feature'
created: '2026-04-12'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['_bmad-output/planning-artifacts/architecture.md']
---

## Intent

**Problem:** 很多游戏卡池有时间长度，玩家可以在卡池期间获取额外资源（每日收入），所以概率会随时间变化。当前计算未考虑这一因素，无法给出"囤X天后抽取"的建议。

**Approach:** 新增卡池时间输入UI，扩展概率计算支持时间维度，展示动态概率预测曲线，给出囤积建议。

## Boundaries & Constraints

**Always:**
- 用户可设置卡池开始/结束日期
- 用户可输入每日资源收入
- 系统计算卡池期间可获取的额外资源
- 展示概率随时间变化的预测

**Ask First:**
- 是否需要考虑不同时间点的概率变化曲线

**Never:**
- 不修改现有概率计算核心逻辑
- 不改变现有数据结构

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 用户设置卡池时间 | 开始日期、结束日期 | 计算持续天数，展示预测 | 正常计算 |
| 用户输入每日收入 | 每日60原石 | 计算额外资源，更新概率 | 正常计算 |
| 卡池已过半 | 当前日期在卡池中间 | 显示剩余时间概率预测 | 正常计算 |
| 卡池已结束 | 当前日期超过结束日期 | 提示卡池已结束 | 显示提示 |
| 无每日收入 | 每日收入为0 | 概率不随时间变化 | 正常显示 |

## Code Map

- `pages/planning/planning.js` -- 需扩展，添加卡池时间设置和动态概率计算
- `pages/planning/planning.wxml` -- 需扩展，添加卡池时间输入UI
- `core/calculator/dynamic-probability-calculator.js` -- 新增动态概率计算器

## Tasks & Acceptance

**Execution:**
- [ ] `core/calculator/dynamic-probability-calculator.js` -- 创建动态概率计算器
- [ ] `pages/planning/planning.js` -- 添加卡池时间数据和计算逻辑
- [ ] `pages/planning/planning.wxml` -- 添加卡池时间输入UI
- [ ] `pages/planning/planning.wxss` -- 添加UI样式

**Acceptance Criteria:**
- Given 用户设置卡池时间，when 输入开始和结束日期，then 计算并显示卡池持续天数
- Given 用户输入每日收入，when 计算，then 展示概率随时间变化的预测
- Given 卡池期间有足够时间囤积，when 分析，then 给出"囤X天后抽取"建议
- Given 卡池已结束，when 查看，then 显示提示信息

## Spec Change Log

## Design Notes

### 数据结构设计

```javascript
// 页面数据扩展
data: {
  // 卡池时间设置
  poolStartDate: '',      // 卡池开始日期 (YYYY-MM-DD)
  poolEndDate: '',        // 卡池结束日期 (YYYY-MM-DD)
  dailyIncome: 0,         // 每日资源收入
  poolDays: 0,            // 卡池持续天数
  remainingDays: 0,       // 剩余天数

  // 动态概率预测
  probabilityTimeline: [], // 概率时间线 [{day, date, resources, probability}]
  optimalWaitDays: 0,     // 最优等待天数
  waitAdvice: ''          // 等待建议
}
```

### 动态概率计算逻辑

```javascript
function calculateDynamicProbability(resources, config, timeRange) {
  const { poolStartDate, poolEndDate, dailyIncome } = timeRange;
  const timeline = [];

  // 计算卡池持续天数
  const poolDays = calculateDaysBetween(poolStartDate, poolEndDate);

  // 遍历每一天计算概率
  for (let day = 0; day <= poolDays; day++) {
    const additionalResources = dailyIncome * day;
    const totalResources = resources + additionalResources;
    const probability = calculateProbability(totalResources, config);

    timeline.push({
      day,
      date: addDays(poolStartDate, day),
      resources: totalResources,
      probability
    });
  }

  // 找出最优等待天数
  const optimal = findOptimalWaitDay(timeline);

  return { timeline, optimalWaitDays: optimal.day, waitAdvice: generateAdvice(optimal) };
}
```

### UI设计

```
┌─────────────────────────────────────┐
│ 📅 卡池时间设置                      │
├─────────────────────────────────────┤
│ 开始日期: [2026-04-12]              │
│ 结束日期: [2026-05-12]              │
│ 卡池时长: 30天                       │
│                                     │
│ 每日收入: [60] 原石/天              │
│ 预计获得: 1800 原石                  │
├─────────────────────────────────────┤
│ 📈 概率预测                          │
│                                     │
│   概率                               │
│   100%│            ╭──────          │
│    80%│         ╭──╯                │
│    60%│      ╭──╯                   │
│    40%│   ╭──╯                      │
│    20%│──╯                           │
│       └────────────────────────     │
│         0   10   20   30 天         │
│                                     │
│ 💡 建议: 囤积20天后抽取，概率可达85% │
└─────────────────────────────────────┘
```

## Verification

**Manual checks:**
- 设置卡池时间，检查天数计算是否正确
- 输入每日收入，检查概率预测是否更新
- 检查等待建议是否合理
- 修改时间范围，检查预测是否重新计算