---
title: '概率动态更新功能'
type: 'feature'
created: '2026-04-12'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['_bmad-output/planning-artifacts/architecture.md']
---

## Intent

**Problem:** 规划页面输入资源变化时，概率显示组件（probability-display 和 probability-chart）使用硬编码测试数据，未随资源输入动态更新，用户无法看到实时计算结果。

**Approach:** 在 `onResourceChange` 中调用 `CalculatorFactory` 重新计算概率分布，将计算结果通过 `setData` 传递给概率组件，替换硬编码绑定。

## Boundaries & Constraints

**Always:**
- 使用现有的 `CalculatorFactory.createCalculator(config)` 和 `calculator.calculate(params)` API
- 保持防抖保存逻辑（300ms延迟）
- 概率计算结果必须经过 `Result` 对象包装验证

**Ask First:**
- 如果需要修改组件接口（如新增属性），需确认
- 如果需要持久化 currentPity（当前保底进度），需确认数据存储方式

**Never:**
- 不修改 probability-display 或 probability-chart 组件内部实现
- 不删除现有的测试数据生成逻辑（可保留用于调试）
- 不改变 gameService 的现有接口

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 用户输入原石数量 | primogems=1600 | probability-display显示≈10%概率，chart显示分布曲线 | 正常计算 |
| 用户输入足够保底资源 | primogems=14400 (90抽) | probability-display显示≈100%，chart完整曲线 | 正常计算 |
| 用户输入0资源 | primogems=0, fates=0 | probability-display显示0%，chart空或起点 | 计算结果为0 |
| 资源变化快速连续输入 | 连续多次修改 | 防抖后只计算一次，最后结果生效 | 防抖处理 |
| 计算器返回错误 | config无效 | 保持上次结果或显示加载状态 | console.error，不崩溃 |

## Code Map

- `pages/planning/planning.js` -- 规划页面逻辑，需添加概率计算调用
- `pages/planning/planning.wxml` -- 规划页面模板，需修改组件绑定
- `core/calculator/calculator-factory.js` -- 计算器工厂，已有createCalculator方法
- `core/calculator/base-calculator.js` -- 基础计算器，已有calculate方法
- `config/games/genshin.js` -- 原神配置，含baseRate/pityType等参数
- `config/games/starrail.js` -- 星铁配置，同结构

## Tasks & Acceptance

**Execution:**
- [x] `pages/planning/planning.js` -- 在 `onResourceChange` 中调用 CalculatorFactory 计算概率，更新 `calculatedProbability` 和 `calculatedDistribution` 数据 -- 实现核心动态更新逻辑
- [x] `pages/planning/planning.js` -- 新增 `calculateProbability` 方法封装计算逻辑，在 `onShow` 中初始化调用 -- 确保页面加载时也显示初始概率
- [x] `pages/planning/planning.wxml` -- 修改 probability-display 和 probability-chart 组件绑定，使用 `{{calculatedProbability}}` 和 `{{calculatedDistribution}}` -- 替换硬编码测试数据
- [x] `pages/planning/planning.js` -- 添加 currentPity 状态（默认0），后续可扩展为用户输入 -- 预留保底进度扩展点

**Acceptance Criteria:**
- Given 用户在规划页面输入原石数量，当 资源值变化，then probability-display 显示基于该资源计算的概率百分比
- Given 用户输入足够保底的资源数量（如14400原石），当 计算完成，then probability-display 显示接近100%的概率
- Given 页面首次加载，当 onShow 执行，then 概率组件显示基于当前存储资源的初始计算结果
- Given 计算器返回错误结果，当 错误发生，then 页面不崩溃，console 输出错误信息

## Spec Change Log

## Design Notes

概率计算流程：

```javascript
// 计算参数构建
const totalPulls = Math.floor(resources.primogems / 160) + resources.intertwinedFates;
const target = { pulls: Math.min(totalPulls, config.hardPity), currentPity: this.data.currentPity || 0 };
const calculator = CalculatorFactory.createCalculator(config);
const result = calculator.calculate({ resources, target, config });

// 提取结果
if (result.success) {
  const distribution = result.data;
  const finalProbability = distribution[distribution.length - 1].cumulativeProbability;
  this.setData({ calculatedProbability: finalProbability, calculatedDistribution: distribution });
}
```

distribution 数组结构：`[{pull, singleProbability, cumulativeProbability, expectedValue}, ...]`

## Verification

**Manual checks:**
- 在微信开发者工具中打开规划页面，修改原石数量，观察概率数字是否变化
- 检查 probability-chart 曲线是否随资源变化重新绘制
- 测试连续快速输入（防抖验证）

## Suggested Review Order

**核心计算逻辑**

- 概率计算入口方法，验证配置和资源后计算概率分布
  [`planning.js:134`](../../pages/planning/planning.js#L134)

- 资源变化触发概率重新计算，实现动态更新
  [`planning.js:107`](../../pages/planning/planning.js#L107)

- 页面加载时初始化计算，确保首次显示有数据
  [`planning.js:78`](../../pages/planning/planning.js#L78)

**UI组件绑定**

- 概率显示组件绑定动态计算结果，替换硬编码值
  [`planning.wxml:47`](../../pages/planning/planning.wxml#L47)

- 概率图表组件绑定分布数据，支持条件渲染
  [`planning.wxml:62`](../../pages/planning/planning.wxml#L62)

- 无数据时的提示，改善用户体验
  [`planning.wxml:69`](../../pages/planning/planning.wxml#L69)