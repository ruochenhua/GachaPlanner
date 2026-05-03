## Why

经过上一轮 UX 打磨（`ux-polish-overview-planning`）后，在实际使用中又发现了三个严重影响体验的核心问题：

1. **资源分配模拟器逻辑错误**：玩家只设定了原神的目标，但模拟器中仍然显示崩铁（未设定目标的游戏），导致玩家误以为崩铁也在资源分配范围内，产生困惑
2. **复合目标完全不可配置**：二游玩家的真实需求是「0+1」「2+1」「6+5」这样的组合（角色命座 + 武器精炼），当前系统只支持单一目标（角色或武器二选一），无法表达真实抽卡意图
3. **规划页面视觉设计混乱**：信息层级不清、表单拥挤、颜色搭配不协调、触控区域过小，整体给人一种「半成品」的感觉，需要彻底重构

这三个问题分别对应**逻辑缺陷**、**功能缺失**和**体验灾难**，优先级均为 P0。

## What Changes

### 1. 模拟器只显示有目标的游戏（逻辑修复）
- overview.js 的 `loadData()` 中，`allocations` 和 `goalsData` 应该只包含**设定了目标**的游戏
- 未设定目标的游戏只在 fallback 游戏列表中展示，不参与资源分配模拟
- overviewService 的 `detectConflicts` 和 `generateStrategies` 已经只处理 `activeGames`（有目标的游戏），但 `allocations` 的构建层没有过滤

### 2. 复合目标支持（功能增强）
- 目标模型从单一目标扩展为「主目标 + 子目标」结构
- 支持常见组合快捷输入：0+0、0+1、1+1、2+1、6+1、6+5 等
- 每个子目标独立配置：类型（角色/武器）、期望命座/精炼、大保底状态
- 概率计算累加所有子目标的抽数需求

### 3. 规划页面设计重构（体验重构）
- 重新设计页面视觉系统：更清晰的卡片分隔、更合理的留白、更突出的主操作按钮
- 重构表单布局：减少视觉噪音，提升信息扫描效率
- 统一颜色系统和字体层级
- 优化触控区域，确保最小 88rpx 的点击热区

## Capabilities

### New Capabilities
- `composite-target-model`: 复合目标数据模型——支持角色+武器组合配置
- `target-preset-shortcuts`: 目标预设快捷输入——0+0/0+1/2+1/6+5 等一键选择
- `planning-page-redesign`: 规划页面视觉重构——全新布局、配色、交互

### Modified Capabilities
- `overview-allocation-filter`: 资源分配模拟器只显示有目标的游戏

## Impact

- **Pages**: `pages/planning/planning`（复合目标 + 页面重构）、`pages/overview/overview`（模拟器过滤）
- **Services**: `services/goal-service.js`（目标模型扩展）、`services/overview-service.js`（模拟器过滤）
- **Components**: `components/goal-card`（复合目标展示适配）
- **Storage**: `services/planning-storage.js`（数据迁移，兼容旧目标格式）

## Acceptance Criteria

- [x] 只设定原神目标时，overview 模拟器只显示原神，不显示崩铁
- [x] 可以配置「胡桃 0+1」（角色 0 命 + 专武 1 精）并正确计算概率
- [x] 可以配置「雷电将军 6+5」并正确计算概率
- [x] 旧版本的单目标数据可以正常加载，自动迁移为单个子目标的复合目标
- [x] 规划页面在开发者工具中预览时视觉层次清晰、无拥挤感
