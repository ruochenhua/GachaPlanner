## 任务依赖关系

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│   1.x    │───▶│   2.x    │    │   3.x    │
│ 数据层   │    │ 组件层   │    │ 服务层   │
│ (基础)   │    │ (可并行) │    │ (可并行) │
└──────────┘    └────┬─────┘    └────┬─────┘
                     │               │
                     └───────┬───────┘
                             ▼
                        ┌──────────┐
                        │   4.x    │
                        │ 页面重构 │
                        │ (依赖 1/2/3)
                        └────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         ┌─────────┐   ┌─────────┐   ┌─────────┐
         │  5.x    │   │  6.x    │   │  7.x    │
         │ planning│   │ 测试    │   │ TabBar  │
         │ (可并行)│   │ (依赖全部)│   │ (依赖4) │
         └─────────┘   └─────────┘   └─────────┘
```

## 1. 数据层与存储

- [x] 1.1 扩展 PlanningStorage 数据模型，新增 `targets` 数组字段（含 id, type, name, rarity, constellations, isGuaranteed, poolStartDate, poolEndDate, isActive）。注：`probability` 为实时计算值，不持久化存储
- [x] 1.2 实现 PlanningStorage 数据版本迁移：从 `1.0.0` 到 `2.0.0`，旧数据无 targets 时默认空数组
- [x] 1.3 新增 PlanningStorage 目标操作方法：`saveTarget(gameId, target)`、`removeTarget(gameId, targetId)`、`getTargets(gameId)`
- [x] 1.4 验证数据兼容性：旧版本数据加载后，overview 页面正常降级展示现有资源概况

## 2. 核心组件开发

- [x] 2.1 创建 `goal-card` 组件：展示游戏目标、概率数字（48rpx 视觉焦点）、还差抽数、卡池时间；支持三档状态色（≥80%绿/50%~80%黄/<50%红）；右上角 `···` 菜单（编辑/删除）
- [x] 2.2 创建 `allocation-bar` 组件：展示游戏资源分配条、静态进度条（不可交互）、`[−10] [−1] [数值] [+1] [+10]` 按钮、点击数值弹出输入
- [x] 2.3 创建 `strategy-card` 组件：展示方案名称、资源分配对比、概率对比、结论文案；提供「预览效果」和「确认采用」两个操作按钮
- [x] 2.4 创建 `conflict-alert` 组件：检测多游戏冲突时展示提示卡片；主按钮「帮我算一下怎么分配」、次要链接「暂不处理」

## 3. 服务层开发

- [x] 3.1 创建 `goal-service.js`：封装目标 CRUD 操作，对外提供 `setGoal(gameId, target)`、`deleteGoal(gameId, targetId)`、`getGoals()`、`getGoalsByGame(gameId)`
- [x] 3.2 实现资源分配守恒计算逻辑：`calculateAllocation(games, adjustments)`，调整某游戏时自动从概率最高的其他游戏扣除，保持总资源不变
- [x] 3.3 实现策略方案生成器：`generateStrategies(games)`，基于当前资源生成「现状/集中/均衡」三种方案，含资源分配和概率计算
- [x] 3.4 实现冲突检测逻辑：`detectConflicts(games, threshold = 0.8)`，当 ≥2 个游戏达成概率 < 80% 时返回冲突列表
- [x] 3.5 在 `game-service.js` 新增 `batchCalculateProbabilities(gameIds)` 批量概率计算接口：接受游戏 ID 数组，返回各游戏的达成概率映射，避免 overview 页逐游戏串行调用

## 4. 总览页重构

- [x] 4.1 重写 `pages/overview/overview.wxml`：新增 goal-section（横向滚动目标卡片 + 添加按钮）、alert-section（冲突提示）、simulator-section（折叠态模拟器）、strategy-section（策略方案列表）
- [x] 4.2 重写 `pages/overview/overview.wxss`：首屏高度控制（目标卡片横向滚动 + 冲突提示 + 折叠模拟器 ≤ 750rpx），莫兰迪暖色系风格延续
- [x] 4.3 重写 `pages/overview/overview.js`：`loadOverviewData()` 加载目标数据并计算概率；`onAllocationChange()` 调用守恒计算 + 300ms throttle；`onStrategyPreview()` 临时应用方案到模拟器；`onStrategyApply()` 确认应用并保存
- [x] 4.4 实现首屏信息架构：目标卡片横向滑动（减少垂直占用）、模拟器默认折叠、冲突提示条件展示
- [x] 4.5 复用 `overview-card` 为模拟器折叠态内的 summary 行：展示「总资源/目标数/平均达成率」，使用现有样式结构；无目标用户（降级模式）保留完整 `overview-card` 作为 fallback

## 5. 单游戏规划页配合改造

- [x] 5.1 在 `pages/planning/planning.wxml` 底部新增「设定目标」区域：目标名称输入、目标类型选择（角色/武器/其他）、期望命座/精炼选择
- [x] 5.2 在 `pages/planning/planning.js` 新增目标保存逻辑：区分「新增模式」和「编辑模式」。新增模式调用 `saveTarget(gameId, target)` 创建目标；编辑模式调用 `updateTarget(gameId, targetId, target)` 更新已有目标
- [x] 5.3 规划页加载时自动读取已有目标并回显到表单：若存在目标则进入编辑模式（表单预填充、按钮文案为「更新目标」）；若无目标则进入新增模式（表单为空、按钮文案为「设定目标」）

## 6. 兼容与测试

- [x] 6.1 旧数据兼容测试：无 targets 字段的旧数据加载后，overview 页面正常展示现有资源概况（空状态引导）
- [x] 6.2 单游戏用户场景测试：只有一个目标时不显示冲突提示，策略方案只显示「现状」和「集中」两种
- [x] 6.3 资源守恒测试：总资源 180 抽，A 增加 30 → B 自动减少 30，总资源保持 180
- [x] 6.4 性能测试：快速连续点击 [+/-] 按钮，页面不卡顿，概率更新有 300ms throttle
- [x] 6.5 交互测试：点击「预览效果」→ 模拟器临时更新 → 点击「取消预览」→ 恢复原状

## 7. TabBar 与导航调整

- [x] 7.1 修改 `app.json` tabBar list 顺序：将 `pages/overview/overview` 前置为第一个 tab，名称为「总览」
- [x] 7.2 验证所有页面的导航跳转路径正确（从 overview 跳转到 planning 时携带 gameId 参数）
