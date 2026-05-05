# Tasks: Game Config Unification + Game Selector

## Phase 1: 配置层统一化（模块渐进式）

### 模块 A：genshin + 依赖（先做一个完整的，验证流程）

- [x] A.1 重写 `config/games/genshin.js` 为增强版格式
  - 使用 `_template.js` 的 `createGameConfig`
  - 保留所有核心参数
  - 添加 `metadata` 字段
  - **保留旧字段别名**（兼容层）：`hardPity` (number)、`softPityStart`、`softPityIncrement`、`guaranteeRate`、`primogemsToFate`
- [x] A.2 修改 `services/game-service.js` 中 genshin 相关的资源读取逻辑（通过 `gameConfig.resources.primary/secondary`）
  - `getGameResources()`：重写遍历逻辑
    - 旧：`Object.keys(config.resources).forEach(key => ...)`
    - 新：直接读取 `config.resources.primary` 和 `config.resources.secondary`
    - 注意：不同游戏的资源名称不同（如 starrail 的 stellarJade），但结构统一为 primary/secondary
- [x] A.3 修改 `pages/planning/planning.js` 中 genshin 相关的字段访问
  - `resources` 遍历方式：`Object.keys(config.resources)` → `config.resources.primary/secondary`
  - `conversionRate`：`primogemsToFate` / `stellarJadeToPass` → `primaryToPull`
  - `hardPity`：`config.hardPity` (number) → `config.hardPity?.count`
  - `targetTypes`：结构不变（`targetTypes[type].hardPity` / `targetTypes[type].guaranteeRate` 保持原样），无需修改
- [x] A.4 修改 `core/calculator/` 中引用旧字段的地方
  - `calculator-factory.js`：`config.guaranteeRate` → `config.guarantee?.rate`
  - `hard-pity.js`：`config.hardPity` → `config.hardPity?.count`
  - `soft-pity.js`：`config.softPityStart` → `config.softPity?.start`
  - `soft-pity.js`：`config.softPityIncrement` → `config.softPity?.increment`
  - `guarantee-calculator.js`：`config.hardPity` → `config.hardPity?.count`
  - `dynamic-probability-calculator.js`：`config.hardPity` → `config.hardPity?.count`
  - `combined-probability-calculator.js`：`config.hardPity` → `config.hardPity?.count`
- [x] A.5 运行测试验证 genshin 模块功能正常（全部 291 个测试通过）

### 模块 B：starrail + 依赖

- [x] B.1 重写 `config/games/starrail.js` 为增强版格式（同 A.1 模式）
- [x] B.2 验证 starrail 的规划计算结果与改造前一致（测试通过）

### 模块 C：其余游戏配置

- [x] C.1 从 `arknights-enhanced.js` 迁移为 `config/games/arknights.js`
  - 修正 `gameId` 拼写（`arnights` → `arknights`）
- [x] C.2 从 `fgo-enhanced.js` 迁移为 `config/games/fgo.js`
- [x] C.3 合并 `hok-enhanced.js` + `hok-luck.js` 为 `config/games/hok.js`
- [x] C.4 从 `onmyoji-multi-pool.js` 迁移为 `config/games/onmyoji.js`

### 模块 D：配置加载器与验证器

- [x] D.1 更新 `config-loader.js`
  - 删除旧的基础版 `require`
  - 显式注册所有增强版配置：`genshin`, `starrail`, `arknights`, `fgo`, `hok`, `onmyoji`
  - 更新 `loadAllGames()` 返回增强版格式
  - 更新 `loadGameConfig()` 返回增强版格式
- [x] D.2 更新 `config-validator.js`（`validateEnhancedConfig` 已验证新字段结构）
  - 验证增强版配置的必填字段
  - 验证 `metadata` 字段结构
  - 验证 `resources` 新结构
- [x] D.3 删除旧文件（`-enhanced.js` / `-luck.js` / `-multi-pool.js` / `config-template-enhanced.js` 已删除）
  - 删除 `config/games/*-enhanced.js` 和 `*-luck.js` 等示例文件
  - 删除 `config/config-template-enhanced.js`（已复制到 `games/_template.js`）

### 模块 E：全局适配与清理

- [x] E.1 修改 `pages/overview/overview.js`（已适配 game-select 流程）
  - `game-service` API 变更适配
- [x] E.2 修改 `pages/history/history.js` 及 `history-detail.js`（无旧字段引用，无需修改）
  - 如有引用游戏配置字段，一并适配
- [x] E.3 修改 `pages/index/index.js`（已适配新字段）
  - 如有引用游戏配置字段，一并适配
- [x] E.4 删除兼容层字段
  - 从增强版配置中移除旧字段别名（hardPity/softPityStart/softPityIncrement/guaranteeRate/primogemsToFate）
  - 代码中清理所有 fallback 逻辑
  - 配置文件改用新格式对象（hardPity: {count}, softPity: {start, increment}）

### 模块 F：回归测试

- [x] F.1 运行 `npx jest --no-coverage`，全部 291 个测试通过
- [ ] F.2 在开发者工具中验证原神/崩铁的规划计算结果与改造前一致（需手动）
- [x] F.3 验证新注册的游戏配置可正常加载（通过 Jest 测试验证）

## Phase 2: Game Selector 界面

### 2.1 页面骨架

- [x] 2.1.1 新建 `pages/game-select/` 目录
- [x] 2.1.2 创建 `game-select.json`（`navigationStyle: custom`，引入 `custom-nav-bar`）
- [x] 2.1.3 创建 `game-select.wxml`（根 view + `{{themeClass}}`）
- [x] 2.1.4 创建 `game-select.wxss`（页面级样式）
- [x] 2.1.5 创建 `game-select.js`（页面逻辑骨架 + `themeService.apply()`）
- [x] 2.1.6 在 `app.json` 中注册 `pages/game-select/game-select`

### 2.2 可复用组件

- [x] 2.2.1 新建 `components/search-bar/` 搜索栏组件
  - 输入框 + 清除按钮
  - 防抖输入（150ms，复用 `utils/debounce.js`）
  - `themeClass` 支持
- [x] 2.2.2 新建 `components/filter-tabs/` 分类筛选 Tab 组件
  - 横向滚动
  - 激活态样式
  - `themeClass` 支持
- [x] 2.2.3 新建 `components/letter-index/` 字母索引导航组件
  - 点击跳转（不实现拖动）
  - `themeClass` 支持

### 2.3 游戏网格

- [x] 2.3.1 新建 `components/game-select-grid/` 游戏网格组件
  - 2 列网格布局
  - 游戏卡片（图标 + 名称 + 辅助信息行）
  - 缺省图标策略（首字母 + CSS 渐变，基于 gameId 哈希分配颜色）
  - `binderror` 图标加载失败降级
  - 点击态（opacity + 背景变化，不使用 transform scale）
  - `themeClass` 支持

### 2.4 页面逻辑

- [x] 2.4.1 实现 `onLoad`：加载全部游戏列表 + 用户使用统计
- [x] 2.4.2 实现搜索过滤（实时过滤 name/sortKey/tags）
- [x] 2.4.3 实现分类过滤（全部/推荐/RPG/动作/策略/卡牌/休闲）
- [x] 2.4.4 实现排序功能（热门/字母/最近使用，icon 循环切换）
  - 排序状态持久化：`wx.setStorageSync('gp_game_select_sort_by', sortBy)`
- [x] 2.4.5 实现字母索引动态生成与点击跳转
- [x] 2.4.6 实现图标加载失败降级逻辑
- [x] 2.4.7 实现空状态（搜索无结果/分类无游戏）
- [x] 2.4.8 实现返回行为
  - game-select 选择游戏后使用 `wx.redirectTo` 进入 planning
  - 这样 planning 返回时直接回到 overview

### 2.5 接入现有流程

- [x] 2.5.1 修改 `pages/overview/overview.js` 的 `onAddGoal()`
  - 删除 `wx.showActionSheet` 调用
  - 改为 `wx.navigateTo({ url: '/pages/game-select/game-select' })`
- [ ] 2.5.2 验证 overview → game-select → planning 的完整流程（需开发者工具）
- [ ] 2.5.3 验证 planning 返回时直接回到 overview（需开发者工具）

### 2.6 样式与适配

- [x] 2.6.1 浅色模式样式审查
- [x] 2.6.2 深色模式样式审查（`.dark-mode` 变量覆盖）
- [x] 2.6.3 组件 `.json` 添加 `"styleIsolation": "apply-shared"`
- [x] 2.6.4 适配不同屏幕尺寸（iPhone SE / Pro Max / iPad Mini）——使用 rpx 单位，2 列 flex 布局

### 2.7 测试

- [x] 2.7.1 Jest 单元测试——新增 `tests/utils/game-select-utils.test.js`，24 个测试用例全部通过
- [ ] 2.7.2 开发者工具审查（搜索/筛选/排序/字母导航）（需手动）
- [ ] 2.7.3 iOS 真机测试（深浅色模式切换）（需手动）
- [ ] 2.7.4 Android 真机测试（深浅色模式切换）（需手动）
