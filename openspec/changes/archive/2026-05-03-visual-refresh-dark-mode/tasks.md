## Phase 1: 地基（2天）

### 1.1 建立语义化 Token 系统

- [x] 1.1.1 在 `app.wxss` 中定义完整的语义化 CSS 变量（Light 模式）
  - 背景层：--color-bg-page, --color-bg-card, --color-bg-card-elevated 等
  - 文本层：--color-text-primary, --color-text-secondary, --color-text-muted 等
  - 品牌/功能色：--color-primary, --color-success, --color-warning, --color-error
  - 边框/分割线：--color-border-default, --color-border-divider
  - 阴影：--color-shadow, --color-shadow-ambient
  - 状态组合：--color-state-success-bg/text, --color-state-warning-bg/text, --color-state-error-bg/text
  
- [x] 1.1.2 在 `app.wxss` 中定义深色模式变量覆盖（`page.dark-mode` class）
  - 所有变量提供对应的深色值
  - 保持莫兰迪暖色系理念（暗但不冷）

- [x] 1.1.3 添加系统媒体查询兜底（`@media (prefers-color-scheme: dark)`）
  - 作用于 `page:not(.force-light):not(.force-dark)`

- [x] 1.1.4 合并 `styles/variables.wxss` 内容至 `app.wxss`
  - 统一使用 `--color-*` 前缀命名
  - 解决色值冲突（如 `#FAF9F7` vs `#FAF8F5` 统一为一个值）
  - `styles/theme.wxss` 中引用路径调整为新的变量名

- [x] 1.1.5 标记 `styles/variables.wxss` 为废弃
  - 在文件顶部加注释说明已合并至 app.wxss
  - 确保无其他文件仍引用该文件

**验收标准：**
- `app.wxss` 包含完整的 Light + Dark 两套语义变量
- `styles/variables.wxss` 不再被任何文件引用
- 构建无报错

---

### 1.2 实现主题服务

- [x] 1.2.1 创建 `services/theme-service.js`
  - 单例模式
  - `init()`：读取 storage + 系统主题 + 注册监听
  - `setPreference(pref)`：支持 'light' | 'dark' | 'system'
  - `resolve()`：返回实际生效主题（手动优先 > 系统）
  - `apply()`：同步 page class + 广播事件
  - `onChange(cb)` / `offChange(cb)`：供 Canvas 组件订阅

- [x] 1.2.2 在 `app.js` 的 `onLaunch` 中初始化 theme-service

- [x] 1.2.3 验证主题切换三档逻辑
  - 系统深色 → 页面显示深色
  - 手动选浅色 → 页面强制浅色（覆盖系统）
  - 手动选深色 → 页面强制深色
  - 手动选跟随系统 → 恢复系统响应

- [x] 1.2.4 验证主题偏好持久化
  - 切换主题后杀掉小程序重进，偏好保持

**验收标准：**
- theme-service 三档切换逻辑正确
- 偏好持久化可用
- 低版本微信无报错（ graceful fallback 到浅色）

---

### 1.3 自定义导航栏组件

- [x] 1.3.1 创建 `components/custom-nav-bar/` 组件
  - `.js`：计算 statusBarHeight、navBarHeight、capsuleHeight
  - `.wxml`：基础结构，支持传入 title
  - `.wxss`：背景色/文字色/边框色使用 CSS 变量
  - `.json`：组件声明

- [x] 1.3.2 在 `app.json` 中设置 `"navigationStyle": "custom"`

- [x] 1.3.3 在 `pages/index/index.json` 中验证自定义导航栏
  - 作为首个试点页面

- [ ] 1.3.4 验证 iOS/Android 胶囊按钮安全区
  - iPhone（有/无 notch）
  - Android 主流机型

**验收标准：**
- 自定义导航栏在深浅模式下样式正确
- 胶囊按钮不遮挡导航栏内容
- 标题文字垂直居中

---

## Phase 2: 样式迁移（4-5天）

### 2.1 全局工具类迁移

- [x] 2.1.1 替换 `styles/common.wxss` 中的硬编码阴影
  - `.shadow-sm/md/lg` 中 `rgba(68, 64, 60, 0.x)` → `--color-shadow`

- [x] 2.1.2 验证全局工具类在深浅模式下的表现

**验收标准：**
- common.wxss 中无硬编码 rgba 阴影
- 深浅模式下阴影可见度合理

---

### 2.2 页面样式迁移（按优先级）

- [x] 2.2.1 `pages/planning/planning.wxss`
  - ~80+ 处硬编码颜色替换为语义变量
  - 重点：card 背景、chip 颜色、input 边框、timeline、按钮

- [x] 2.2.2 `pages/overview/overview.wxss`
  - ~40+ 处硬编码颜色替换
  - 重点：goal-card 容器、summary bar、simulator、strategy section

- [x] 2.2.3 `pages/history-detail/history-detail.wxss`
  - 完全硬编码的老页面，全面替换
  - 注意旧灰色调（`#9B9B9B`、`#4A4A4A`）映射到新变量

- [x] 2.2.4 `pages/history/history.wxss`
  - 硬编码颜色替换

- [x] 2.2.5 `pages/profile/profile.wxss`
  - 硬编码颜色替换（该页面已较规范，工作量小）

- [x] 2.2.6 其余页面（index, planning-data, config-manager, rule-settings, reminder-list, history-detail）
  - 逐一审查并替换硬编码颜色

**验收标准（每页）：**
- grep 该文件无 `#` 开头的硬编码颜色（除渐变计算外）
- 浅色模式下视觉效果与改造前一致
- 深色模式下无明显的"反色错误"（如黑字在黑底上）

---

### 2.3 组件样式迁移（按优先级）

- [x] 2.3.1 `components/goal-card/goal-card.wxss`
  - 替换硬编码颜色
  - 注意状态色（success/warning/error）使用 state 变量

- [x] 2.3.2 `components/suggestion-card/suggestion-card.wxss`
  - 完全硬编码，全面替换
  - 注意语义绿（`#4CAF50`、`#7CB342`）映射到 `--color-success`

- [x] 2.3.3 `components/strategy-card/strategy-card.wxss`
  - 完全硬编码，全面替换

- [x] 2.3.4 `components/conflict-alert/conflict-alert.wxss`
  - 替换硬编码颜色

- [x] 2.3.5 `components/allocation-bar/allocation-bar.wxss`
  - 替换硬编码颜色

- [x] 2.3.6 `components/history-card/history-card.wxss`
  - 替换硬编码颜色

- [x] 2.3.7 `components/history-form/history-form.wxss`
  - 替换硬编码颜色（注意 `#ff4d4f`、`#999` 等外来色）

- [x] 2.3.8 `components/accuracy-stats-card/accuracy-stats-card.wxss`
  - 替换硬编码颜色

- [x] 2.3.9 `components/expiry-warning/expiry-warning.wxss`
  - 替换硬编码颜色

- [x] 2.3.10 `components/hoarding-reminder/hoarding-reminder.wxss`
  - 替换硬编码颜色

- [x] 2.3.11 `components/onboarding-guide/onboarding-guide.wxss`
  - 替换硬编码颜色

- [x] 2.3.12 其余组件（game-card, overview-card, pool-settings 等）
  - 逐一审查并替换

**验收标准（每个组件）：**
- 组件 wxss 中无硬编码颜色
- 深浅模式下组件内部对比度合格

---

### 2.4 对比度修复

- [ ] 2.4.1 检查所有 `--color-text-*` 在 `--color-bg-*` 上的对比度
  - 目标：WCAG AA ≥4.5:1
  - 工具：在线对比度计算器或小程序开发者工具审查

- [ ] 2.4.2 修复不达标的组合
  - 重点：warning 色 `#E4C786` → 可能需要调深或调整背景
  - 重点：muted 文本 `#9C9285` → 可能需要调深

- [ ] 2.4.3 设计师验收
  - 逐页截图对比
  - 标记并修复视觉问题

**验收标准：**
- 所有主要 text-on-background 组合对比度 ≥4.5:1
- 设计师签字确认视觉效果

---

## Phase 3: JS 组件 & Canvas 改造（2-3天）

### 3.1 JS 计算颜色组件改造

- [x] 3.1.1 `components/goal-card/goal-card.js`
  - 移除 `statusBg` / `statusColor` 的 JS 计算
  - 改为输出 `statusClass`（'status-success' | 'status-warning' | 'status-danger'）
  - 在 `goal-card.wxss` 中定义对应 class 的变量引用

- [x] 3.1.2 `components/suggestion-card/suggestion-card.js`
  - 移除 `bg` / `text` / `border` 的 JS 计算
  - 改为输出 `typeClass`
  - 在 wxss 中定义对应 class

- [x] 3.1.3 `components/probability-display/probability-display.js`
  - 移除风险等级的颜色计算
  - 改为输出风险 class

- [x] 3.1.4 `components/onboarding-guide/onboarding-guide.js`
  - 移除 `indicatorColor`、`backgroundColor` 的硬编码
  - 改为 class 驱动或 CSS 变量

**验收标准：**
- 上述 4 个组件的 `.js` 文件中无硬编码 hex 颜色
- 深浅模式下状态色正确显示

---

### 3.2 Canvas 图表深色适配

- [x] 3.2.1 `components/probability-chart/probability-chart.js`
  - 建立 `CHART_COLORS` 色表（light/dark 两套）
  - 注册 theme-service 监听
  - 主题切换时调用 `redrawNow()`
  - 所有 draw 方法中颜色从色表读取

- [x] 3.2.2 `components/history-trend-chart/history-trend-chart.js`
  - 同上改造

- [x] 3.2.3 `components/resource-curve-chart/resource-curve-chart.js`
  - 同上改造
  - 注意 `data.chartConfig.colors` 对象需要重构为色表索引

**验收标准：**
- 3 个图表在浅色模式下显示正常（与改造前一致）
- 3 个图表在深色模式下配色正确（曲线/网格/文字清晰可辨）
- 主题切换时图表无闪烁，平滑重绘

---

## Phase 4: 页面配置 & 主题入口（1天）

### 4.1 页面导航栏配置

- [x] 4.1.1 所有 11 个页面的 `.json` 添加 `"navigationStyle": "custom"`

- [x] 4.1.2 所有 11 个页面的 `.wxml` 顶部插入 `<custom-nav-bar title="..." />`
  - 标题与当前页面一致

- [x] 4.1.3 验证每个页面的导航栏显示正常
  - 标题正确
  - 返回按钮行为正常（如有）

**验收标准：**
- 所有页面使用自定义导航栏
- 导航栏在深浅模式下样式正确

---

### 4.2 主题切换入口 UI

- [x] 4.2.1 在 `pages/profile/profile.wxml` 中增加主题设置区域
  - 三档选项：浅色 / 深色 / 跟随系统
  - 使用 radio 或 segment 控件风格

- [x] 4.2.2 在 `pages/profile/profile.js` 中绑定 theme-service
  - 读取当前偏好并回显
  - 切换时调用 `themeService.setPreference()`

- [x] 4.2.3 验证切换后即时生效

**验收标准：**
- profile 页面可切换三档主题
- 切换后当前页面及后续页面即时响应
- 杀掉重进后偏好保持

---

## Phase 5: 回归测试（1-2天）

### 5.1 全页面截图对比

- [ ] 5.1.1 浅色模式下所有页面截图，与改造前对比
  - 确保无视觉回归（颜色、布局、间距不变）

- [ ] 5.1.2 深色模式下所有页面截图
  - 确保无明显的反色错误
  - 确保文本可读

### 5.2 主题切换场景测试

- [ ] 5.2.1 系统切换场景
  - iOS/Android 系统设置中切换深色/浅色
  - 小程序在前台时即时响应
  - 小程序在后台时恢复后正确响应

- [ ] 5.2.2 手动切换场景
  - 浅色 → 深色 → 跟随系统 → 浅色
  - 每次切换后页面颜色正确

- [ ] 5.2.3 持久化场景
  - 设置手动深色 → 杀掉小程序 → 重进 → 仍为深色
  - 设置跟随系统 → 杀掉小程序 → 重进 → 跟随系统

### 5.3 兼容性测试

- [ ] 5.3.1 低版本微信回退
  - 基础库 < 2.11.0 的设备上保持浅色模式
  - 无报错，功能正常

- [ ] 5.3.2 iOS/Android 真机测试
  - iPhone（有 notch / 无 notch）
  - Android 主流机型（小米、华为、OPPO 等）
  - 导航栏安全区正确

### 5.4 功能回归

- [ ] 5.4.1 验证业务逻辑未受影响
  - 目标增删改查正常
  - 概率计算结果正确
  - 资源模拟器交互正常
  - 数据存储/读取正常

**验收标准：**
- 所有测试用例通过
- 无视觉回归
- 无功能 regression
- 低版本兼容无报错
