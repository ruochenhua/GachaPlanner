## Why

`overview-redesign` 已交付核心功能，但经专业交互审视和真实玩家反馈，总览页与规划页存在明显的信息架构不合理、交互流程不通顺、核心操作隐蔽等问题。这些问题导致用户（尤其是二游抽卡玩家）无法高效完成「设定目标→输入资源→查看概率」的核心任务，直接影响产品可用性。

## What Changes

- **规划页信息架构重构**：将「设定目标」从页面底部移至顶部，作为规划页的核心入口；移除与「设定目标」重复的卡池时间设置，改为只读联动显示
- **规划页区块重新排序**：版本信息移至底部；目标设定 → 保底状态 → 资源输入 → 达成概率 → 概率图表 → 攒抽预测 → 版本信息
- **总览页交互打磨**：目标卡片从横向滚动改为竖向列表；修复策略区域重复标题；模拟器步进按钮从 ±1/±10 改为更有意义的步长；冲突提示增加具体解决方案
- **目标表单体验优化**：保存/更新按钮视觉层级提升；移除对概率计算无实质影响的「目标类型」字段；命座/精炼输入增加 0-6 范围校验
- **自动滚动优化**：从总览页点击「添加/编辑目标」跳转到规划页时，页面自动滚动到目标表单区域

## Capabilities

### New Capabilities
- `planning-page-relayout`: 规划页信息架构重构——区块重新排序、卡池时间去重联动、目标区域前置
- `overview-interaction-polish`: 总览页交互打磨——竖向列表、策略标题修复、模拟器步长优化、冲突提示增强
- `target-form-ux`: 目标表单体验优化——按钮视觉层级、字段精简、输入校验、自动滚动

### Modified Capabilities
- （无现有 spec 需要修改，本次为纯 UX 优化，不涉及核心功能需求变更）

## Impact

- **Pages**: `pages/planning/planning`（布局重构）、`pages/overview/overview`（交互优化）
- **Components**: `components/goal-card`（竖向适配）、`components/allocation-bar`（步长调整）、`components/strategy-card`（文案优化）、`components/conflict-alert`（解决方案增强）
- **Styles**: `pages/planning/planning.wxss`（布局样式）、`pages/overview/overview.wxss`（交互样式）
