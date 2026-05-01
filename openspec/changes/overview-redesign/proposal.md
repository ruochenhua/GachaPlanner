## Why

GachaPlanner 的核心卖点是「多游戏抽卡资源统筹管理」，但当前总览页（`pages/overview`）只是一个「多游戏概率展示板」——用户能看到各游戏的达成概率，却无法在多游戏之间做资源调配和决策对比。这导致产品最核心的差异化价值没有兑现。用户打开总览页后，无法回答「我该把资源集中在哪个游戏？」「如果我从 A 挪资源到 B，结果会怎样？」这些关键问题。

## What Changes

- **重构总览页信息架构**：将当前「展示型」总览页改造为「决策型」资源统筹中心
- **新增目标设定系统**：允许用户为每个游戏设定抽卡目标（角色/武器），总览页展示目标达成概率
- **新增资源分配模拟器**：用户可通过滑块/按钮调整各游戏资源分配，实时查看概率变化
- **新增策略方案对比**：自动生成「保持现状 / 集中最优 / 补充预算」等 2-3 个策略方案，用户可一键应用
- **新增资源冲突检测**：当多个游戏目标达成概率均低于阈值时，自动提示冲突并引导调整
- **调整 TabBar 顺序**：将总览页提升为首页，强化其作为核心入口的定位

## Capabilities

### New Capabilities

- `goal-management`: 用户在每个游戏下设定抽卡目标（角色/武器/其他），包含目标名称、期望命座/精炼、卡池时间等信息。目标数据持久化到 PlanningStorage。
- `resource-allocation-simulator`: 跨游戏资源分配模拟，允许用户调整各游戏资源数量，实时重算达成概率，总资源量保持守恒。
- `strategy-suggestion`: 基于当前资源分配自动生成 2-3 个策略方案（保持现状、集中最优游戏、均衡分配或补充预算），展示各方案的资源分配和达成概率对比。
- `conflict-detection`: 检测多游戏目标之间的资源冲突，当 ≥2 个游戏达成概率低于 80% 时触发提示。

### Modified Capabilities

- `overview-display`: 现有总览页的概率展示逻辑将被保留但重构，summary-card 和 game-card 组件将被 goal-card、allocation-bar、strategy-card 等新组件替代或扩展。

## Impact

- **Pages**: `pages/overview/overview` 全面重构（wxml/wxss/js）
- **Components**: 新增 `goal-card`、`allocation-bar`、`strategy-card`、`conflict-alert` 四个组件；改造 `overview-card` 为新的 summary 形式
- **Services**: `services/planning-storage.js` 扩展目标数据结构；`services/game-service.js` 增加批量概率计算接口
- **Core**: `core/calculator/calculator-factory.js` 和 `core/calculator/combined-probability-calculator.js` 复用，不改动核心算法
- **Data Model**: PlanningStorage 数据版本从 `1.0.0` 升级到 `2.0.0`，新增 `targets` 数组字段，兼容旧数据（targets 为空时展示现有资源概况作为降级）
- **App Config**: `app.json` tabBar 顺序调整，总览页前置
