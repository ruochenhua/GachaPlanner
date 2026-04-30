---
title: '多游戏综合概率计算'
type: 'feature'
created: '2026-04-12'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['_bmad-output/planning-artifacts/architecture.md']
---

## Intent

**Problem:** 用户只能看到各游戏独立的概率（如原神65%、星铁42%），无法看到"如果把所有资源集中到一个游戏"的综合达成概率，无法进行跨游戏的资源分配策略决策。

**Approach:** 新增综合概率计算器，计算资源集中策略下的最优概率，在首页总览卡片展示综合概率和最优策略建议。

## Boundaries & Constraints

**Always:**
- 综合概率 = max(各游戏概率) 当资源全投入该游戏时
- 需考虑不同游戏的资源转换率差异
- 展示最优策略建议

**Ask First:**
- 是否需要支持用户自定义资源分配权重

**Never:**
- 不修改现有概率计算逻辑
- 不改变现有数据结构

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 用户查看首页总览 | 多个游戏有资源 | 显示综合概率和最优策略建议 | 正常计算 |
| 只有一个游戏 | 单游戏场景 | 综合概率 = 该游戏概率 | 正常显示 |
| 所有游戏无资源 | 资源为0 | 综合概率 = 0%，无策略建议 | 正常处理 |
| 资源转换率不同 | 原神160原石=1抽，星铁160星琼=1抽 | 正确转换计算 | 正常计算 |

## Code Map

- `core/calculator/combined-probability-calculator.js` -- 新增综合概率计算器
- `pages/index/index.js` -- 需扩展，计算综合概率
- `components/overview-card/overview-card.js` -- 需扩展，展示综合概率
- `components/overview-card/overview-card.wxml` -- 需扩展，展示最优策略建议

## Tasks & Acceptance

**Execution:**
- [ ] `core/calculator/combined-probability-calculator.js` -- 创建综合概率计算器
- [ ] `pages/index/index.js` -- 在loadData中调用综合概率计算，更新数据
- [ ] `components/overview-card/overview-card.js` -- 新增combinedProbability和optimalStrategy属性
- [ ] `components/overview-card/overview-card.wxml` -- 展示综合概率和最优策略建议

**Acceptance Criteria:**
- Given 用户打开首页，when 多个游戏有资源，then 显示综合概率和最优策略建议
- Given 所有资源集中到某游戏，when 计算综合概率，then 显示该游戏的最大可能概率
- Given 只有一个游戏，when 查看，then 综合概率等于该游戏概率

## Spec Change Log

## Design Notes

### 综合概率计算逻辑

```javascript
// combined-probability-calculator.js

/**
 * 计算综合概率
 * @param {Array} gamesData - 各游戏数据 [{gameId, resources, config, probability}]
 * @returns {Object} {combinedProbability, optimalGameId, strategy}
 */
function calculateCombinedProbability(gamesData) {
  if (!gamesData || gamesData.length === 0) {
    return { combinedProbability: 0, optimalGameId: null, strategy: null };
  }

  // 单游戏场景
  if (gamesData.length === 1) {
    return {
      combinedProbability: gamesData[0].probability,
      optimalGameId: gamesData[0].gameId,
      strategy: 'single'
    };
  }

  // 计算每个游戏在获得所有资源时的概率
  const totalResources = calculateTotalResources(gamesData);
  const scenarios = gamesData.map(game => {
    // 假设所有资源都投入该游戏
    const hypotheticalProbability = calculateHypotheticalProbability(
      game,
      totalResources
    );
    return {
      gameId: game.gameId,
      gameName: game.name,
      currentProbability: game.probability,
      hypotheticalProbability
    };
  });

  // 找出最优策略
  const optimal = scenarios.reduce((best, current) =>
    current.hypotheticalProbability > best.hypotheticalProbability ? current : best
  );

  return {
    combinedProbability: optimal.hypotheticalProbability,
    optimalGameId: optimal.gameId,
    optimalGameName: optimal.gameName,
    strategy: 'concentrate',
    scenarios
  };
}
```

### 首页展示

```
┌─────────────────────────────────────┐
│ 📊 资源总览                         │
├─────────────────────────────────────┤
│ 总资源: 280抽                       │
│ 本月规划: 3                         │
│ 平均概率: 53%                       │
│                                     │
│ 🎯 综合概率: 78%                    │
│ 💡 建议: 集中原神资源达成概率最高   │
└─────────────────────────────────────┘
```

## Verification

**Manual checks:**
- 打开首页，检查综合概率是否正确显示
- 检查最优策略建议是否合理
- 修改资源后检查综合概率是否更新
- 单游戏场景检查综合概率是否等于独立概率