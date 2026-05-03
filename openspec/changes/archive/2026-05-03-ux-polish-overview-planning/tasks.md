## 1. 规划页信息架构重构

- [x] 1.1 重新排列 planning.wxml 区块顺序：目标设定 → 保底状态 → 资源输入 → 达成概率 → 概率图表 → 攒抽预测 → 版本信息
- [x] 1.2 从 pool-settings 区域移除卡池开始/结束日期 picker
- [x] 1.3 在 pool-settings 区域添加目标卡池时间的只读展示（从 targetForm 读取）
- [x] 1.4 实现目标日期变更时自动同步 poolStartDate / poolEndDate
- [x] 1.5 在 planning.wxml 达成概率区域添加「目标名称」标签，明确当前概率对应哪个目标
- [x] 1.6 简化概率图表：默认折叠状态，点击展开后显示简化版柱状图（只显示达成率/期望值），移除 S 曲线详细参数
- [x] 1.7 调整 planning.wxss 中各 section 的间距和视觉层级
- [x] 1.8 实现 onLoad 中 autoFocusTarget=true 时自动 scroll 到目标表单区域

## 2. 总览页交互打磨

- [x] 2.1 在 overview.wxml 顶部添加资源总量 Summary Bar（显示所有游戏 总抽数 / 总目标数 / 预计达成目标数）
- [x] 2.2 将 overview.wxml 中 goals-scroll 从横向滚动改为竖向列表（scroll-x → flex-column）
- [x] 2.3 调整 goal-card 样式适配竖向列表布局
- [x] 2.4 修复 overview.wxml 策略区域重复标题问题（移除第 119 行无条件渲染的标题）
- [x] 2.5 将 allocation-bar 的 stepSizes 从 [1, 10] 改为 [10, 50]
- [x] 2.6 将 allocation-bar 的 percentage 标签从百分比改为「已分配 / 总预算」形式，避免与概率混淆
- [x] 2.7 在 conflict-alert 中增加具体解决方案文案（从 overviewService 获取建议）
- [x] 2.8 简化 strategy-card 的预览→应用流程：点击策略卡片直接显示效果摘要（抽数变化+概率变化），点击「应用」一键生效，取消独立的 preview 弹窗
- [x] 2.9 在 strategy-card 中增加与现状对比信息（当前分配 vs 建议分配，当前概率 vs 应用后概率）
- [x] 2.10 调整 overview.wxss 中 summary bar、竖向列表和模拟器的样式

## 3. 目标表单体验优化

- [x] 3.1 从 planning.wxml 目标表单中移除「目标类型」picker 字段
- [x] 3.2 优化保存/更新按钮样式：主色调背景、全宽、最小高度 88rpx
- [x] 3.3 优化删除按钮样式：次级样式（浅色背景 + 红色文字）
- [x] 3.4 在 onTargetConstellationsChange 中添加 0-6 范围校验和边界修正
- [x] 3.5 移除 planning.js 中 targetForm.type 的默认值和相关逻辑

## 4. 验证与收尾

- [x] 4.1 验证 planning 页面所有事件绑定与 JS 方法匹配
- [x] 4.2 验证 overview 页面所有事件绑定与 JS 方法匹配
- [x] 4.3 运行现有单元测试确保无回归
- [x] 4.4 在开发者工具中预览验证布局效果（需在开发者工具中手动确认）

## 5. 移除冗余保底状态区域

- [x] 5.1 从 planning.wxml 移除独立的「保底状态」section-card
- [x] 5.2 从 planning.js data 中移除页面级 currentPity / isGuaranteed
- [x] 5.3 移除 onCurrentPityChange / onGuaranteedChange 事件处理函数
- [x] 5.4 验证 calculateProbability 不再依赖页面级保底状态（已使用目标级字段）
- [x] 5.5 新目标默认值改为从首个目标读取，无目标时默认 0/小保底

## 6. 概率分布图表视觉优化

- [x] 6.1 添加水平虚线网格线（对应 25%/50%/75%/100%）
- [x] 6.2 曲线下方填充改为线性渐变（品牌色 → 透明）
- [x] 6.3 标记文字（当前抽数+概率）添加白色背景防重叠
- [x] 6.4 添加图例说明（实线=当前概率，虚线=预测概率）
- [x] 6.5 优化坐标轴刻度样式（更长、更明显）
- [x] 6.6 运行单元测试确保无回归
