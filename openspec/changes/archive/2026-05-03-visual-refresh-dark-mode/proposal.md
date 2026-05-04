## Why

### 设计哲学：莫兰迪暖色 × 抽卡规划工具

GachaPlanner 采用 **莫兰迪暖色系（Morandi Warm Palette）** 作为核心视觉语言——低饱和度、暖灰底调、柔和内敛。这一选择并非偶然，而是与产品定位深度契合：

**情感对冲**：抽卡本质上带有赌博属性，用户打开工具时往往处于焦虑、纠结、患得患失的状态。莫兰迪色的"安静"特质正好对冲了抽卡机制的"刺激"——工具应该是一块让人冷静下来做决策的地方，而不是加剧紧迫感的警报器。

**场景互补**：二游玩家每天在游戏内接触的是高饱和、发光、粒子特效的视觉轰炸。GachaPlanner 作为"游戏外工具"，视觉上应该是游戏的**反义词**——一个让眼睛休息的避风港。莫兰迪暖灰就像"吃完火锅后的奶茶"，提供视觉喘息空间。

**文化认同**：二游玩家是对审美极度敏感的群体，工具的颜值等于自我表达的一部分。莫兰迪色在中文互联网语境中自带"高级感"和"有品位"的符号意义，帮助工具从"功能满足"升级为"身份认同"。

**功能支撑**：这是一个每天被打开多次、需要长时间阅读数据的工具。莫兰迪色的低对比冲突特性，比高饱和配色更适合数据密集型界面——概率、抽数、日期各就各位，不争不抢，长期看不累眼。

### 当前问题

在这一设计哲学下，当前视觉存在三个必须解决的核心问题：

1. **颜色系统落地不一致**：9 个页面、17 个组件使用硬编码颜色而非 CSS 变量，且现有 `app.wxss` 与 `styles/variables.wxss` 两套变量系统并存、色值冲突（如 `--color-gray-50: #FAF9F7` vs `--gray-50: #FAF8F5`）。这意味着"莫兰迪暖色"的设计理念没有真正沉淀为可维护的工程规范。

2. **关键文本对比度不足**：warning 色 `#E4C786` 在浅色背景 `#FAF9F7` 上对比度仅 1.6:1，主色文本 `#C4A77D` 对比度 2.8:1，均低于 WCAG AA 标准（≥4.5:1）。这不仅影响可读性，也与"安静陪伴"的设计理念相悖——用户不应该费力辨认文字。

3. **完全缺失深色模式**：莫兰迪理念在深色模式下应该延续为"深夜咖啡馆"——暗但不冷。随着 iOS/Android 系统级深色模式普及，以及用户深夜查看规划数据的场景高频出现，小程序需要提供完整的深色配色系统（不是冷酷的科技黑，而是带暖调的深灰），并支持自动跟随系统和手动切换。

### 范围约束

本次 change **严格限定为视觉层改造**：只修改配色、主题机制、导航栏样式，不改动任何业务逻辑、数据结构、交互流程或功能行为。

## What Changes

### 1. 统一颜色系统
- 废弃 `styles/variables.wxss` + `styles/theme.wxss` 中的旧变量系统
- 以 `app.wxss` 的 `--color-*` 体系为唯一来源，扩展为语义化令牌（`--color-bg-page`、`--color-text-primary` 等）
- 将 ~564 处硬编码颜色替换为 CSS 变量引用

### 2. 修复对比度缺陷
- 调整主色、warning 色、muted 文本色的色值
- 所有 text-on-background 组合确保 WCAG AA ≥4.5:1

### 3. 引入深色模式配色系统
- 建立完整的 Dark Mode 设计令牌，与 Light Mode 共用同一组语义变量名
- 通过 `page.dark-mode` class 覆盖变量值
- 背景、卡片、文本、边框、阴影的完整反转映射

### 4. 主题切换机制
- **自动跟随系统**：`wx.onThemeChange` + `@media (prefers-color-scheme: dark)`
- **手动切换入口**：「我的」页面增加「浅色 / 深色 / 跟随系统」三档切换
- **用户偏好持久化**：`theme_preference` 存储键
- **优先级**：手动设置 > 系统主题

### 5. 自定义导航栏
- `app.json` 及所有页面改为 `"navigationStyle": "custom"`
- 新建 `components/custom-nav-bar` 组件，背景色/文字色跟随 CSS 变量自动切换
- 处理 iOS/Android 胶囊按钮安全区适配

### 6. Canvas 图表适配
- `probability-chart`、`history-trend-chart`、`resource-curve-chart` 增加深色配色分支
- 通过 theme-service 事件监听实现动态重绘

### 7. JS 计算颜色组件改造
- `goal-card`、`suggestion-card`、`probability-display`、`onboarding-guide`
- 将 JS 中硬编码的 `statusColor`/`statusBg` 改为 CSS class 驱动，JS 只输出状态枚举

## Capabilities

### New Capabilities
- `dark-mode-system`: 完整的深色模式配色系统与动态切换能力，包含浅色/深色两套设计令牌、自动跟随系统主题、手动切换入口、自定义导航栏适配
- `color-system-unification`: 颜色系统统一化，建立唯一颜色来源，消除硬编码颜色，合并冲突的两套变量系统

### Modified Capabilities
- `overview-display`: 总览页视觉展示支持深色模式（仅颜色反转，无功能变更）
- `planning-page-display`: 规划页视觉展示支持深色模式（仅颜色反转，无功能变更）
- `history-display`: 历史记录页视觉展示支持深色模式（仅颜色反转，无功能变更）

## Impact

- **全局样式**：`app.wxss` 变量系统全面重构，新增语义化变量系列
- **废弃文件**：`styles/variables.wxss` 内容合并至 `app.wxss` 后废弃
- **Pages**: 11 个页面的 wxss 需审查并替换硬编码颜色，wxml 顶部插入 custom-nav-bar
- **Components**: 25+ 个组件的 wxss 需审查并替换硬编码颜色；4 个 JS 组件改 class 驱动；3 个 Canvas 组件增加深色色表
- **App Config**: `app.json` 改为自定义导航栏；`app.js` 初始化 theme-service
- **Storage**: 新增用户主题偏好存储键 `theme_preference`
- **No breaking changes**: 旧数据完全兼容，浅色模式为默认，深色模式为新增能力，不修改任何业务逻辑

## Acceptance Criteria

- [ ] 所有页面和组件 wxss 中的硬编码颜色已替换为 CSS 变量（仅剩合理的渐变/透明计算）
- [ ] `app.wxss` 为唯一颜色来源，`styles/variables.wxss` 已废弃
- [ ] 浅色模式下所有 text-on-background 对比度 ≥4.5:1
- [ ] 深色模式下所有 text-on-background 对比度 ≥4.5:1
- [ ] 跟随系统主题开关自动切换（iOS/Android 系统级深色模式）
- [ ] 手动切换「浅色/深色/跟随系统」三档生效，偏好持久化
- [ ] 杀掉小程序重进后主题偏好保持
- [ ] 3 个 Canvas 图表在深色模式下配色正确
- [ ] 自定义导航栏在深浅模式下样式正确，胶囊按钮不遮挡
- [ ] 低版本微信（无 dark-mode 支持）回退到浅色模式，不报错
- [ ] 不修改任何业务逻辑：目标增删改查、概率计算、资源模拟、数据存储等行为保持不变
