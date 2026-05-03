## Context

`ux-polish-overview-planning` 已完成信息架构调整和交互打磨，但在真实使用中暴露了三个更深层的结构性问题：

1. **模拟器数据污染**：`overview.js` 的 `loadData()` 遍历 `gameService.getSupportedGames()` 返回的所有游戏构建 `gamesData`，即使某游戏未设定目标也会出现在 `allocations` 中。`overviewService` 内部已区分 `activeGames`，但视图层没有过滤
2. **目标模型过于简化**：当前 `targetForm` 只有一个 `constellations` 字段，无法表达「角色+武器」的复合需求。二游玩家 80% 的场景是组合目标（0+1、2+1、6+5）
3. **页面视觉灾难**：表单字段密集堆叠、section 之间缺乏呼吸感、主操作按钮不够突出、颜色对比度不足

## Goals / Non-Goals

**Goals:**
- 资源分配模拟器精确反映「有目标才参与分配」的业务规则
- 支持角色+武器的复合目标配置，覆盖 0+0 到 6+5 的常见组合
- 规划页面视觉层次清晰、留白合理、触控舒适

**Non-Goals:**
- 不增加新的游戏配置字段或修改概率计算核心算法（只扩展输入层）
- 不改动总览页的 Summary Bar 和策略卡片（已在上一轮完成）
- 不引入第三方 UI 库

## Decisions

### 1. 模拟器过滤：allocations 只包含有目标的游戏
- **Rationale**：资源分配的前提是「有目标」。没有目标的游戏不应该参与分配，否则会造成误导
- **Implementation**：`overview.js` 中 `allocations` 从 `goalsData` 构建而非 `gamesData`；`totalPulls` 只统计有目标游戏的抽数
- **Fallback 保留**：未设定目标的游戏仍在页面下方的 fallback 游戏列表中展示，方便玩家快速跳转设定

### 2. 复合目标模型：主目标 + 子目标数组
- **Rationale**：「角色+武器」是二游的核心组合概念，独立为两个目标会导致玩家在 overview 看到两个卡片，不符合心智模型
- **Implementation**：
  ```js
  target: {
    id: 'target_xxx',
    name: '胡桃',
    poolStartDate: '',
    poolEndDate: '',
    subTargets: [
      { type: 'character', desiredRank: 0, isGuaranteed: false, pity: 0 },
      { type: 'weapon', desiredRank: 1, isGuaranteed: false, pity: 0 }
    ]
  }
  ```
- **UI 快捷输入**：在目标表单顶部提供「0+0」「0+1」「1+1」「2+1」「6+1」「6+5」等快捷按钮，点击自动填充子目标
- **概率计算**：分别计算每个子目标的抽数需求，累加为总需求，再计算达成概率

### 3. 规划页面视觉重构
- **Rationale**：当前页面是功能堆叠的结果，没有统一的视觉系统。需要从头设计信息层级和留白规则
- **Key changes**：
  - 使用卡片容器分隔不同 section，卡片间保持 32rpx 间距
  - 目标表单作为「主卡片」使用强调色边框突出
  - 输入框统一高度 80rpx，圆角 12rpx
  - 主按钮全宽、高度 96rpx、圆角 16rpx
  - 减少 emoji 使用，改用简洁图标或纯色标签
  - 保底状态、资源输入、概率展示使用统一的卡片样式

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 复合目标模型与旧数据不兼容 | 加载旧数据时自动迁移：将旧目标的 `constellations` + `isGuaranteed` 迁移为单个子目标 |
| 复合目标概率计算复杂度上升 | 保持子目标独立计算再累加的简单模型，不引入联合概率（角色和武器是独立卡池） |
| 页面重构改动面大可能引入 bug | 按 section 逐步重构，每改完一个 section 在开发者工具中验证 |
| 快捷按钮无法覆盖所有组合 | 快捷按钮覆盖 80% 场景，同时保留手动微调入口 |

## Data Flow

```
旧目标数据 → PlanningStorage.loadPlanningData() → 自动迁移为复合目标格式
                                                      ↓
复合目标表单 ← 快捷按钮 / 手动输入 ← planning.js targetForm
                                                      ↓
分别计算每个 subTarget 的抽数需求 → 累加总需求 → CalculatorFactory
                                                      ↓
达成概率 ← 总抽数 vs 总需求 ← 概率展示区域
```
