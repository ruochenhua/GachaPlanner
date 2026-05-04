# 视觉刷新与深色模式 — 技术设计

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        运行时架构                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Layer 1: 主题控制器 (services/theme-service.js)        │   │
│   │  • 读取用户偏好 (storage)                                │   │
│   │  • 监听系统主题 (wx.onThemeChange)                       │   │
│   │  • 决策：手动 > 系统                                     │   │
│   │  • 广播 themeChange 事件给 Canvas 组件                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Layer 2: 样式注入器 (app.js / page onShow)             │   │
│   │  • 给 page 节点加 class (dark-mode / force-light)       │   │
│   │  • 同步自定义导航栏背景色                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Layer 3: 消费端                                        │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│   │  │ WXSS 样式   │  │ Canvas 图表  │  │ JS 计算颜色组件  │  │   │
│   │  │ 自动继承    │  │ 监听事件重绘 │  │ 改 class 驱动   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Token 命名规范

以 `app.wxss` 的 `--color-*` 前缀为基础，采用**语义化用途命名**。同一变量名在深浅模式下值不同，使用方零感知。

### 2.1 命名规则

```
--color-{用途类别}-{具体角色}-{状态修饰符}

用途类别：bg / text / border / shadow / state
具体角色：page / card / primary / secondary / divider 等
状态修饰符：elevated / inverse / focus / hover（可选）
```

### 2.2 完整令牌表

```css
/* ========== 背景层 ========== */
--color-bg-page
--color-bg-card
--color-bg-card-elevated
--color-bg-popover
--color-bg-toast
--color-bg-input
--color-bg-button

/* ========== 文本层 ========== */
--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse       /* 深色按钮上的白字 / 深色模式下反色 */
--color-text-link

/* ========== 品牌 & 功能色 ========== */
--color-primary
--color-primary-light
--color-primary-dark
--color-success
--color-warning
--color-error
--color-info

/* ========== 边框 & 分割线 ========== */
--color-border-default
--color-border-divider
--color-border-focus

/* ========== 阴影 ========== */
--color-shadow
--color-shadow-ambient

/* ========== 状态背景（success/warning/error 的 bg+text 组合） ========== */
--color-state-success-bg
--color-state-success-text
--color-state-warning-bg
--color-state-warning-text
--color-state-error-bg
--color-state-error-text
```

### 2.3 深色模式覆盖

```css
page {
  --color-bg-page: #FAF9F7;
  --color-bg-card: #FFFFFF;
  --color-text-primary: #1F1B18;
  /* ... 所有浅色值 */
}

page.dark-mode {
  --color-bg-page: #1C1917;
  --color-bg-card: #292524;
  --color-text-primary: #F5F3F0;
  /* ... 所有深色值 */
}

/* 系统媒体查询兜底 */
@media (prefers-color-scheme: dark) {
  page:not(.force-light):not(.force-dark) {
    /* 复制 dark-mode 的变量覆盖 */
  }
}
```

**拓展性**：未来加"护眼模式" `page.sepia-mode`，同一套变量名换一套值即可，零代码侵入。

## 3. 主题切换机制

### 3.1 决策优先级

```
用户手动设置了「深色」?
    ├─ 是 → 强制深色（给 page 加 dark-mode + force-dark class）
    └─ 否 → 用户手动设置了「浅色」?
           ├─ 是 → 强制浅色（给 page 加 force-light class，覆盖媒体查询）
           └─ 否 → 跟随系统媒体查询
```

### 3.2 主题服务 (theme-service.js)

单例模式，在 `app.js onLaunch` 中初始化：

```javascript
class ThemeService {
  init() {
    // 1. 读取用户偏好
    this.userPreference = wx.getStorageSync('theme_preference') || 'system';
    // 2. 读取系统主题
    this.systemTheme = wx.getSystemInfoSync().theme || 'light';
    // 3. 监听系统变化
    wx.onThemeChange((res) => {
      this.systemTheme = res.theme;
      if (this.userPreference === 'system') this.apply();
    });
    this.apply();
  }

  setPreference(pref) { /* 'light' | 'dark' | 'system' */ }
  resolve() { /* 返回实际生效主题 */ }
  apply() { /* 同步 page class + 导航栏 + 广播事件 */ }
  onChange(cb) { /* Canvas 组件注册监听 */ }
}
```

### 3.3 Page Class 管理

```javascript
// 应用到当前页面
const page = getCurrentPages().pop();
if (!page) return;

// 移除旧 class
const classes = ['dark-mode', 'force-dark', 'force-light'];
// 添加新 class（根据 resolved theme）
```

在自定义导航栏组件中，通过 `getCurrentPages()` 获取当前页面节点，读取其 classList 判断主题。或更简单地：导航栏背景色直接用 CSS 变量 `--color-bg-page`，自动跟随。

## 4. 自定义导航栏

### 4.1 技术方案

- `app.json` 中 `"window": { "navigationStyle": "custom" }`
- 每个页面 wxml 顶部插入 `<custom-nav-bar title="页面标题" />`
- 胶囊按钮安全区通过 `wx.getMenuButtonBoundingClientRect()` 计算

### 4.2 组件接口

```xml
<!-- custom-nav-bar.wxml -->
<view class="nav-bar" style="padding-top: {{statusBarHeight}}px; height: {{navBarHeight}}px;">
  <view class="nav-content" style="height: {{capsuleHeight}}px;">
    <text class="nav-title">{{title}}</text>
  </view>
</view>
```

```css
.nav-bar {
  background-color: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border-divider);
}
.nav-title {
  color: var(--color-text-primary);
}
```

深色模式下背景色和文字色**自动跟随 CSS 变量**，无需 JS 干预。

### 4.3 iOS/Android 适配

| 平台 | 状态栏高度 | 胶囊按钮位置 |
|------|-----------|-------------|
| iOS | 44px ( notch ) / 20px ( 非 notch ) | 右侧固定 |
| Android | 24-32px 不等 | 右侧固定 |

通过 `wx.getSystemInfoSync()` 获取 `statusBarHeight`，通过 `wx.getMenuButtonBoundingClientRect()` 获取胶囊按钮位置和高度，动态计算导航栏布局。

## 5. Canvas 图表适配

### 5.1 方案

Canvas 2D 绘制不走 CSS 变量，需要 JS 层维护一套色表映射：

```javascript
const CHART_COLORS = {
  light: {
    curve: '#C4A77D', grid: '#F0EDE9', text: '#78716C',
    fillStart: 'rgba(196, 167, 125, 0.35)', fillEnd: 'rgba(196, 167, 125, 0.02)'
  },
  dark: {
    curve: '#D4BC99', grid: '#3E3833', text: '#A8A29E',
    fillStart: 'rgba(212, 188, 153, 0.25)', fillEnd: 'rgba(212, 188, 153, 0.01)'
  }
};
```

### 5.2 主题监听

```javascript
const themeService = require('../../services/theme-service');

Component({
  lifetimes: {
    attached() {
      themeService.onChange(this.onThemeChange);
      this.theme = themeService.resolve();
    },
    detached() {
      themeService.offChange(this.onThemeChange);
    }
  },
  methods: {
    onThemeChange(theme) {
      this.theme = theme;
      this.redrawNow();
    }
  }
});
```

### 5.3 受影响组件

| 组件 | 文件 | 需替换颜色 |
|------|------|-----------|
| probability-chart | `.js` | 轴/网格/曲线/渐变/文字/图例 |
| history-trend-chart | `.js` | 背景/网格/曲线/标记/文字 |
| resource-curve-chart | `.js` | 配置对象中所有颜色字段 |

## 6. JS 计算颜色组件改造

### 6.1 问题

以下组件在 JS 中计算颜色并通过 `setData` 传递到 WXML：

- `goal-card.js`：`statusBg`、`statusColor`
- `suggestion-card.js`：`bg`、`text`、`border`
- `probability-display.js`：风险等级颜色
- `onboarding-guide.js`：`indicatorColor`、`backgroundColor`

### 6.2 改造方案

**从"JS 输出颜色值"改为"JS 输出状态枚举，WXML 用 class 绑定"**。

改造前：
```javascript
// goal-card.js
this.setData({
  statusColor: probability >= 0.8 ? '#7FB069' : '#C47070',
  statusBg: probability >= 0.8 ? '#F0F7EC' : '#FDE8E8'
});
```

改造后：
```javascript
// goal-card.js
this.setData({
  statusClass: probability >= 0.8 ? 'status-success' : 'status-danger'
});
```

```css
/* goal-card.wxss */
.status-success {
  color: var(--color-state-success-text);
  background: var(--color-state-success-bg);
}
.status-danger {
  color: var(--color-state-error-text);
  background: var(--color-state-error-bg);
}
```

### 6.3 需改造文件

| 组件 | 改造内容 |
|------|---------|
| goal-card.js | `statusBg`/`statusColor` → `statusClass` |
| suggestion-card.js | `bg`/`text`/`border` → `typeClass` |
| probability-display.js | 风险颜色 → 风险 class |
| onboarding-guide.js | 指示器/背景色 → class 驱动 |

## 7. 硬编码颜色迁移策略

### 7.1 迁移优先级

按**影响范围 × 修改难度**排序：

| 优先级 | 文件/区域 | 原因 |
|--------|----------|------|
| P0 | `styles/common.wxss` | 全局工具类，硬编码阴影，影响所有页面 |
| P0 | `app.wxss` 变量定义 | 地基，必须先定义好所有语义变量 |
| P1 | `pages/planning/planning.wxss` | 80+ 处硬编码，最密集 |
| P1 | `pages/overview/overview.wxss` | 40+ 处硬编码 |
| P1 | `pages/history-detail/history-detail.wxss` | 完全硬编码的老页面 |
| P2 | `components/goal-card/` | JS + WXSS 双改造 |
| P2 | `components/suggestion-card/` | 完全硬编码 |
| P2 | `components/strategy-card/` | 完全硬编码 |
| P3 | 其余页面和组件 | 零散硬编码 |

### 7.2 颜色替换规则

建立**颜色映射表**，开发时按表替换：

| 硬编码值 | 语义变量 | 出现次数 |
|---------|---------|---------|
| `#FFFFFF` / `white` / `#fff` | `--color-bg-card` | 70+ |
| `#2C2520` | `--color-text-primary` | 38 |
| `#7A7168` | `--color-text-secondary` | 35 |
| `#C4A77D` | `--color-primary` | 63 |
| `#E5E0D8` / `#E8E4DE` | `--color-border-divider` | 28 |
| `rgba(0,0,0,0.05)` ~ `rgba(0,0,0,0.2)` | `--color-shadow` | 14+ |
| `#9B9B9B` / `#6B6B6B` / `#4A4A4A` | `--color-text-secondary` / `--color-text-muted` | 40+ |

**注意**：`#FFFFFF` 的 70+ 次出现中，大部分是"卡片背景"语义，少数是"按钮上的白字"语义。后者应替换为 `--color-text-inverse`（浅色下白，深色下黑），不能简单全局替换。

## 8. 兼容性与回退

### 8.1 低版本微信

基础库 < 2.11.0 不支持 `prefers-color-scheme`：
- 无 `dark-mode` class 时，page 保持浅色变量默认值
- 不影响功能，只是看不到深色模式

### 8.2 媒体查询与 Class 的优先级

```css
/* 手动深色（最高优先级） */
page.dark-mode { ... }

/* 手动浅色（覆盖媒体查询） */
page.force-light { ... }

/* 系统深色（最低优先级，无手动设置时生效） */
@media (prefers-color-scheme: dark) {
  page:not(.force-light):not(.force-dark) { ... }
}
```

## 9. 文件变更清单

### 9.1 新增文件

```
services/theme-service.js              # 主题控制器
components/custom-nav-bar/
  ├─ custom-nav-bar.js
  ├─ custom-nav-bar.wxml
  ├─ custom-nav-bar.wxss
  └─ custom-nav-bar.json
```

### 9.2 修改文件

```
app.js                                  # 初始化 theme-service
app.wxss                                # 重写变量系统，增加 dark-mode 覆盖
app.json                                # navigationStyle: custom

pages/*/*.json                          # 11 个页面：加 navigationStyle: custom
pages/*/*.wxml                          # 11 个页面：顶部插入 custom-nav-bar
pages/*/*.wxss                          # 11 个页面：替换硬编码颜色

components/*/*.wxss                     # 25+ 组件：替换硬编码颜色
components/probability-chart/*.js       # Canvas 深色色表
components/history-trend-chart/*.js     # Canvas 深色色表
components/resource-curve-chart/*.js    # Canvas 深色色表
components/goal-card/*.js               # JS 改 class 驱动
components/suggestion-card/*.js         # JS 改 class 驱动
components/probability-display/*.js     # JS 改 class 驱动
components/onboarding-guide/*.js        # JS 改 class 驱动

styles/common.wxss                      # 阴影变量化
styles/variables.wxss                   # 废弃（内容合并至 app.wxss）
styles/theme.wxss                       # 引用路径调整
```

### 9.3 废弃文件

```
styles/variables.wxss                   # 内容合并至 app.wxss 后移除引用
```

## 10. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| `#FFFFFF` 语义混淆 | 高 | 逐处审查，区分"卡片背景"和"反色文字"两种语义 |
| Canvas 重绘性能 | 中 | 主题切换时只重绘一次，不监听连续变化 |
| 自定义导航栏安全区 | 中 | 用 `getMenuButtonBoundingClientRect` 真机测试 iOS/Android |
| 旧页面未覆盖 | 低 | 迁移时 grep 所有 `#` 开头的颜色值，确保无遗漏 |
| 设计师色板延迟 | 中 | 先用占位深色值开发，色板确定后批量替换 |
