# Design: Game Config Unification + Game Selector

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         表现层 (Pages)                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   overview   │───▶│ game-select  │───▶│      planning        │  │
│  │  [+ 目标]     │    │ 搜索/筛选/排序 │    │  新增/编辑目标        │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                           │                                         │
│                    ┌──────┴──────┐                                  │
│                    │ game-select- │                                  │
│                    │    grid      │  ← 网格组件                      │
│                    └─────────────┘                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         服务层 (Services)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ game-service │    │ goal-service │    │   history-service    │  │
│  │ getAllGames()│    │ getGoals()   │    │ getAccuracy()        │  │
│  │ getGameById()│    │ createGoal() │    │                      │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         配置层 (Config)                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      config-loader.js                          │  │
│  │  GAME_CONFIGS = {                                             │  │
│  │    genshin: require('./games/genshin'),   ← 增强版格式       │  │
│  │    starrail: require('./games/starrail'),                    │  │
│  │    arknights: require('./games/arknights'),                  │  │
│  │    ...                                                       │  │
│  │  }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 数据流

### 游戏列表加载

```
config/games/*.js
      │
      ▼ require
config-loader.js
      │
      ▼ loadAllGames()
game-service.js
      │
      ▼ getAllGames()
game-select.js (onLoad)
      │
      ▼ setData({ games: [...] })
game-select-grid 组件渲染
```

### 排序与过滤

```
原始游戏列表（全部配置）
      │
      ├─ 搜索过滤 ──▶ keyword 匹配 name / tags
      │
      ├─ 分类过滤 ──▶ metadata.category === 选中分类
      │
      ├─ 排序 ──────▶ 热门(hotScore) / 字母(sortKey) / 最近使用
      │
      ▼
渲染列表（已过滤 + 已排序）
```

## Game Selector 页面布局

```
┌─────────────────────────────────────────┐
│  ←    选择游戏              ⇅ 🔥        │  ← custom-nav-bar + 排序切换
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🔍 搜索游戏名称...     [✕]       │  │  ← 搜索栏（sticky）
│  └───────────────────────────────────┘  │
│                                         │
│  全部 | 推荐 ⭐ | RPG | 动作 | 策略      │  ← 分类筛选 Tab（横向滚动）
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  🎮      │  │  🎮      │            │
│  │ 原神     │  │ 崩铁     │            │  ← 游戏网格（2列）
│  │ 🔥 95 · RPG                         │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  🅰️      │  │  🅱️      │            │
│  │ 明日方舟 │  │ 崩铁     │            │
│  │          │  │          │            │
│  └──────────┘  └──────────┘            │
│                                         │
│        ┌───┐                            │
│        │ A │                            │  ← 字母索引导航（右侧悬浮）
│        │ B │                            │
│        │ F │                            │
│        │ H │                            │
│        │ O │                            │
│        │ Y │                            │
│        └───┘                            │
│                                         │
└─────────────────────────────────────────┘
```

### 搜索栏交互

```
┌─────────────────────────────────────────┐
│  🔍 搜索游戏名称...     [✕]            │  ← 输入时显示清除按钮
└─────────────────────────────────────────┘

输入行为：
- onInput: 实时过滤（防抖 150ms，复用 utils/debounce.js）
- 匹配字段：name（中文）、sortKey（拼音）、tags（标签）
- 空输入时显示全部游戏
- 无结果时显示空状态
```

### 分类筛选 Tab

```
分类列表（横向滚动）：
全部 | 推荐 ⭐ | [动态分类...]

推荐：metadata.isFeatured === true
动态分类：从所有游戏的 metadata.category 提取并去重排序

注意：不设"热门"分类 Tab，避免与排序的"热门"概念冲突
注意：分类列表动态生成，新增游戏配置新 category 时自动出现
```

### 排序切换（Icon 循环）

```
位置：搜索栏右侧（与清除按钮并排）
- 搜索无内容时：显示排序 icon
- 搜索有内容时：显示清除按钮，排序 icon 隐藏或移至搜索栏左侧
样式：icon 按钮，点击循环切换

状态流转：
🔥 热门排序 → 🔤 字母排序 → 🕐 最近使用 → 🔥 热门排序

热门排序：calculateScore(game, userStats) 降序
字母排序：metadata.sortKey 升序
最近使用：按用户添加目标的最后时间降序

数据持久化：sortBy 保存到 wx.setStorageSync('gp_game_select_sort_by')

用户使用统计：
```javascript
// Storage key: gp_user_game_stats
{
  usageCount: { genshin: 5, starrail: 3, ... },
  lastAccessed: { genshin: 1714800000000, starrail: 1714700000000, ... }
}
```

统计更新时机：用户成功添加/编辑目标后，更新对应游戏的 usageCount 和 lastAccessed
```

### 游戏卡片（网格项）

```
┌─────────────────────┐
│                     │
│      🎮 / 🅰️        │  ← 游戏图标 或 缺省占位
│   80rpx × 80rpx     │
│                     │
├─────────────────────┤
│     原神            │  ← 游戏名称（1行截断）
│  🔥 95 · RPG        │  ← 热度分 + 分类（辅助信息行）
└─────────────────────┘

尺寸：列宽 50% - padding，高度自适应
圆角：var(--radius-md)
背景：var(--color-bg-card)
边框：1px solid var(--color-border-default)
点击态：active 时 opacity 0.8 + 背景 var(--color-bg-card-elevated)
热区：整个卡片可点击

注意：不使用 transform: scale(0.95)，避免 overflow 截断问题
```

### 缺省图标样式

```
根据 gameId 首字母确定颜色：

A-H: 渐变 var(--color-primary) → var(--color-primary-light)
I-P: 渐变 var(--color-success) → #8BC476
Q-Z: 渐变 var(--color-info) → #8BAAC0

背景：linear-gradient(135deg, color1, color2)
文字：首字母大写，var(--color-text-inverse)
字体：32rpx bold
```

### 字母索引导航

```
位置：页面右侧，垂直居中
样式：固定宽度 32rpx，半透明背景

交互（简化版）：
- 点击字母 → 滚动到对应游戏位置（scroll-into-view）
- 不实现拖动功能（微信小程序 touchmove 精确映射困难）

安全区适配：
- 字母导航容器顶部添加 padding，避开 iPhone 刘海区域
- padding-top: max(16rpx, env(safe-area-inset-top))

字母列表动态生成：
根据当前过滤后的游戏列表，提取首字母（sortKey[0].toUpperCase()），去重排序
```

### 空状态

```
搜索无结果：
┌─────────────────────────┐
│                         │
│         🔍              │
│                         │
│      未找到相关游戏      │
│    试试其他关键词？      │
│                         │
└─────────────────────────┘

分类无游戏：
┌─────────────────────────┐
│                         │
│         📂              │
│                         │
│     该分类暂无游戏       │
│                         │
└─────────────────────────┘

样式：居中，图标 64rpx，文字 var(--color-text-muted)
```

## 状态管理

```javascript
// game-select.js data
{
  themeClass: '',           // 深浅色模式
  games: [],                // 全部游戏列表（原始数据）
  filteredGames: [],        // 过滤后的游戏列表
  categories: [],           // 分类列表（动态提取）
  activeCategory: 'all',    // 当前选中分类
  keyword: '',              // 搜索关键词
  sortBy: 'hot',            // 排序方式: hot / alpha / recent
  userStats: {},            // 用户使用统计（从 storage 读取）
  letterIndex: [],          // 字母索引列表
  activeLetter: '',         // 当前高亮字母（简化，不实时更新）
  iconFailed: {},           // { gameId: true } 图标加载失败标记
  loading: true             // 加载状态
}
```

## 页面导航

```
overview 页面
    │
    ▼ onAddGoal()
    │
wx.navigateTo({
  url: '/pages/game-select/game-select?mode=select'
})
    │
    ▼ 用户选择游戏
    │
wx.navigateTo({
  url: '/pages/planning/planning?gameId=xxx&autoFocusTarget=true'
})
    │
    ▼ 用户在 planning 按返回
    │
wx.navigateBack() → 直接回到 overview（跳过 game-select）

实现方式：game-select 进入 planning 时使用 redirectTo（替换当前页）

```javascript
// game-select.js
onGameTap(e) {
  const { gameId } = e.currentTarget.dataset;
  wx.redirectTo({
    url: `/pages/planning/planning?gameId=${gameId}&autoFocusTarget=true`
  });
}
```

这样 planning 页面直接替换 game-select，用户按返回直接回到 overview。
比 navigateBack({delta: 2}) 更可靠，不受中间页面状态影响。

可选：支持 mode=switch（切换当前游戏）
```

## 深色模式适配

```css
/* 所有颜色使用 CSS 变量 */
page {
  --search-bg: var(--color-bg-card);
  --search-border: var(--color-border-default);
  --search-text: var(--color-text-primary);
  --search-placeholder: var(--color-text-muted);
  --tab-active: var(--color-primary);
  --tab-inactive: var(--color-text-secondary);
  --card-bg: var(--color-bg-card);
  --card-border: var(--color-border-default);
  --card-active-bg: var(--color-bg-card-elevated);
  --index-bg: rgba(0, 0, 0, 0.3);
  --index-text: var(--color-text-secondary);
  --index-active: var(--color-primary);
}

.dark-mode {
  --index-bg: rgba(255, 255, 255, 0.15);
}
```

## 组件拆分

```
pages/game-select/
├── game-select.js          ← 页面逻辑（搜索/筛选/排序/字母导航）
├── game-select.wxml        ← 页面结构
├── game-select.wxss        ← 页面样式
├── game-select.json        ← 页面配置（usingComponents）
└── components/
    ├── search-bar/         ← 搜索栏组件（可复用）
    │   ├── search-bar.js
    │   ├── search-bar.wxml
    │   ├── search-bar.wxss
    │   └── search-bar.json
    ├── filter-tabs/        ← 分类筛选 Tab 组件
    │   ├── filter-tabs.js
    │   ├── filter-tabs.wxml
    │   ├── filter-tabs.wxss
    │   └── filter-tabs.json
    ├── game-select-grid/   ← 游戏网格组件
    │   ├── game-select-grid.js
    │   ├── game-select-grid.wxml
    │   ├── game-select-grid.wxss
    │   └── game-select-grid.json
    └── letter-index/       ← 字母索引导航组件
        ├── letter-index.js
        ├── letter-index.wxml
        ├── letter-index.wxss
        └── letter-index.json
```

### 生命周期约定

所有注册 `themeService.onChange` 的组件，必须在 `detached` 中注销：

```javascript
Component({
  lifetimes: {
    attached() {
      this._themeCb = (t) => this.setData({ themeClass: t === 'dark' ? 'dark-mode' : '' });
      themeService.onChange(this._themeCb);
    },
    detached() {
      themeService.offChange(this._themeCb);
    }
  }
});
```
