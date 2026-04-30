---
title: '总体规划展示功能'
type: 'feature'
created: '2026-04-12'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['_bmad-output/planning-artifacts/architecture.md']
---

## Intent

**Problem:** 首页游戏卡片显示的概率是硬编码值（65%），未反映真实计算结果；同时缺少所有游戏的总体规划汇总视图，用户无法一目了然地看到各游戏的达成概率和资源分配情况。

**Approach:** 在首页 `loadData()` 中调用 `CalculatorFactory` 为每个游戏计算真实概率，替换硬编码值；增强 `overview-card` 组件展示总体概率汇总信息。

## Boundaries & Constraints

**Always:**
- 复用 `CalculatorFactory` 和计算器逻辑，与规划页面保持一致
- 保持现有数据结构和组件接口兼容
- 概率计算使用默认 currentPity=0

**Ask First:**
- 如果需要大幅修改 overview-card 组件接口，需确认

**Never:**
- 不修改概率计算核心逻辑
- 不改变 gameService 现有接口
- 不在首页进行复杂的保底进度编辑

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 用户打开首页 | 多个游戏有资源数据 | 各游戏卡片显示真实概率，overview-card显示汇总 | 正常计算 |
| 某游戏无资源 | resources为空或0 | 该游戏概率显示0% | 正常处理 |
| 计算失败 | calculator返回error | 该游戏概率显示0%，不阻塞其他游戏 | console.error |
| 单游戏场景 | 只有一个游戏 | 正常显示该游戏概率和汇总 | 正常计算 |

## Code Map

- `pages/index/index.js` -- 首页逻辑，需添加概率计算
- `components/overview-card/overview-card.js` -- 总览卡片，可增强概率汇总
- `components/overview-card/overview-card.wxml` -- 总览卡片模板
- `core/calculator/calculator-factory.js` -- 计算器工厂，已有API

## Tasks & Acceptance

**Execution:**
- [x] `pages/index/index.js` -- 导入 CalculatorFactory，在 loadData 中为每个游戏计算真实概率 -- 替换硬编码值
- [x] `pages/index/index.js` -- 计算总体概率汇总（平均概率或加权平均）-- 提供汇总数据
- [x] `components/overview-card/overview-card.js` -- 新增 averageProbability 属性 -- 接收汇总概率
- [x] `components/overview-card/overview-card.wxml` -- 展示总体概率汇总信息 -- 增强UI展示

**Acceptance Criteria:**
- Given 用户打开首页，当 页面加载完成，then 各游戏卡片显示基于资源的真实概率百分比
- Given 多个游戏有资源，when 计算完成，then overview-card 显示总体概率汇总（如平均概率）
- Given 某游戏计算失败，when 错误发生，then 该游戏概率显示0%，其他游戏正常显示

## Spec Change Log

## Design Notes

首页概率计算流程：

```javascript
// 在 loadData 中为每个游戏计算概率
const CalculatorFactory = require('../../core/calculator/calculator-factory');

// 计算总抽数
const totalPulls = Math.floor(primogems / 160) + fates;
const target = { pulls: Math.min(totalPulls, config.hardPity || 90), currentPity: 0 };

// 创建计算器
const calculator = CalculatorFactory.createCalculator(config);
const result = calculator.calculate({ resources, target, config });

// 提取概率
const probability = result.success && result.data?.length > 0
  ? result.data[result.data.length - 1].cumulativeProbability
  : 0;
```

总体概率汇总计算：
- 简单平均：`averageProbability = probabilities.reduce((a,b) => a+b, 0) / games.length`
- 或加权平均（按资源数量加权）

## Verification

**Manual checks:**
- 打开首页，检查各游戏卡片概率是否为真实计算值
- 修改某游戏资源后返回首页，检查概率是否更新
- 检查 overview-card 是否显示总体概率汇总

## Suggested Review Order

**核心计算逻辑**

- 首页概率计算方法，为单个游戏计算达成概率
  [`index.js:166`](../../pages/index/index.js#L166)

- loadData中遍历游戏并计算真实概率，替换硬编码值
  [`index.js:57`](../../pages/index/index.js#L57)

- 计算总体平均概率并更新页面数据
  [`index.js:112`](../../pages/index/index.js#L112)

**组件增强**

- overview-card新增averageProbability属性
  [`overview-card.js:15`](../../components/overview-card/overview-card.js#L15)

- overview-card展示平均概率统计项
  [`overview-card.wxml:24`](../../components/overview-card/overview-card.wxml#L24)

- 首页传递averageProbability给overview-card组件
  [`index.wxml:13`](../../pages/index/index.wxml#L13)
