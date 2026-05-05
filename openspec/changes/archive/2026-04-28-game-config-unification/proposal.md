# Game Config Unification + Game Selector

## 背景与动机

当前系统仅支持 2 个游戏（原神、崩铁），新增目标时通过 `wx.showActionSheet` 弹出选择。随着游戏库扩展（config/games/ 下已预埋 8 个游戏配置），现有机制存在以下问题：

1. **交互体验差**：`wx.showActionSheet` 最多支持 6 项，无法搜索、筛选、排序
2. **配置模型不统一**：基础版配置（`genshin.js`）与增强版模板（`config-template-enhanced.js`）并存，新游戏接入标准不明确
3. **图标资产缺失**：仅 2 个游戏有图标，其余游戏无默认展示方案
4. **无游戏元数据**：缺少分类、热度、排序键等支持筛选/排序的字段

## 范围

### In Scope

- **Phase 1: 配置层统一化**
  - 将 `config-template-enhanced.js` 复制到 `config/games/_template.js`
  - 重写 `genshin.js` / `starrail.js` 为增强版格式
  - 注册其余 4 个已有配置文件（`arknights-enhanced.js` → `arknights.js`、`fgo-enhanced.js` → `fgo.js`、`hok-enhanced.js` + `hok-luck.js` → `hok.js`、`onmyoji-multi-pool.js` → `onmyoji.js`）
  - 全量修改依赖配置字段的代码（`game-service.js`、`calculator-factory.js`、`planning.js` 等）
  - 为每个游戏配置补充 `metadata` 字段（分类、热度、拼音排序键、标签等）

- **Phase 2: Game Selector 界面**
  - 新建 `pages/game-select/` 页面
  - 搜索栏（实时过滤游戏名称/拼音）
  - 分类筛选 Tab（全部/热门/RPG/动作/策略/卡牌等）
  - 排序功能（热门/字母/最近使用）
  - 网格布局展示游戏卡片（图标 + 名称 + 热门标记）
  - 字母索引导航（右侧悬浮 A-Z）
  - 缺省图标策略（代码生成：首字母 + CSS 渐变色背景）
  - 替换 `overview.js` 中的 `wx.showActionSheet` 调用
  - 符合当前深色模式 UI 设计规范（CSS 变量、custom-nav-bar、themeClass）

### Out of Scope

- 云端游戏列表同步（保持本地静态配置）
- 游戏配置热更新机制
- 自定义游戏创建向导（超出本次范围）
- 为每个新游戏配美术图标（使用代码生成缺省图标）

## 技术方案

### 配置层迁移

```
config/
├── games/
│   ├── _template.js              ← 原 config-template-enhanced.js 复制至此
│   ├── genshin.js                ← 重写为增强版格式
│   ├── starrail.js               ← 重写为增强版格式
│   ├── arknights.js              ← 从 arknights-enhanced.js 迁移（修正 gameId 拼写）
│   ├── fgo.js                    ← 从 fgo-enhanced.js 迁移
│   ├── hok.js                    ← 合并 hok-enhanced.js + hok-luck.js
│   └── onmyoji.js                ← 从 onmyoji-multi-pool.js 迁移
```

**注意**：微信小程序无 `fs` 模块，config-loader 无法运行时动态扫描目录。采用显式注册表模式：

```javascript
// config-loader.js
const GAME_CONFIGS = {
  genshin: require('./games/genshin'),
  starrail: require('./games/starrail'),
  arknights: require('./games/arknights'),
  fgo: require('./games/fgo'),
  hok: require('./games/hok'),
  onmyoji: require('./games/onmyoji')
};
```

增强版配置字段结构：

```javascript
{
  gameId: 'genshin',
  name: '原神',
  version: '2.0.0',
  updatedAt: '2026-04-19',
  
  // 保底机制
  pityType: 'guarantee',
  baseRate: 0.006,
  hardPity: { enabled: true, count: 90, resetOnSuccess: true },
  softPity: { enabled: true, start: 74, increment: 0.06, maxRate: 1.0 },
  guarantee: { enabled: true, rate: 0.5, captureLight: true, captureLightRate: 0.55 },
  
  // 资源
  resources: {
    primary: { id: 'primogems', name: '原石', icon: '/assets/images/games/primogem.png' },
    secondary: { id: 'intertwinedFates', name: '纠缠之缘', icon: '/assets/images/games/intertwined-fate.png' }
  },
  conversionRate: { primaryToPull: 160 },
  
  // 目标类型
  targetTypes: {
    character: { label: '角色', maxRank: 6, hardPity: 90, guaranteeRate: 0.5 },
    weapon: { label: '武器', maxRank: 5, hardPity: 80, guaranteeRate: 0.75 }
  },
  
  // 元数据（内嵌在游戏配置中）
  metadata: {
    category: 'RPG',              // 分类：RPG/动作/策略/卡牌/休闲
    tags: ['开放世界', '二次元'],  // 标签数组
    hotScore: 95,                 // 热度分 0-100
    isNew: false,                 // 新上线标记
    isFeatured: true,             // 推荐标记
    sortKey: 'yuanshen',          // 拼音排序键
    publisher: 'miHoYo'           // 厂商
  }
}
```

### 缺省图标策略

无图标游戏使用 CSS 生成占位：

```css
.game-icon-fallback {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--color-text-inverse);
}
```

根据 `gameId` 哈希分配不同渐变色，避免所有缺省图标一样。

图标加载失败时自动降级为缺省图标：
```xml
<image src="{{gameIcon}}" binderror="onIconError" data-id="{{gameId}}" />
<view wx:if="{{iconFailed[gameId]}}" class="game-icon-fallback">{{firstLetter}}</view>
```

### Game Selector 页面结构

```
pages/game-select/
├── game-select.js
├── game-select.wxml
├── game-select.wxss
├── game-select.json
└── components/
    └── game-select-grid/       ← 游戏网格组件（复用 game-card 或新建）
```

交互流程：

```
overview 页面
    │
    ▼ 点击 [+ 目标]
    │
wx.navigateTo({ url: '/pages/game-select/game-select' })
    │
    ▼
game-select 页面
    │
    ├─ 搜索栏输入 → 实时过滤游戏列表
    ├─ 分类 Tab 切换 → 按 category 过滤
    ├─ 排序下拉 → 热门/字母/最近使用
    ├─ 字母索引 → 快速跳转
    │
    ▼ 点击游戏卡片
    │
wx.navigateTo({ url: '/pages/planning/planning?gameId=xxx&autoFocusTarget=true' })
```

### 热门排序算法

组合策略（本地计算，无云端）：

```javascript
// 排序分 = 全局热度 × 0.6 + 个人使用频率 × 0.4
function calculateScore(game, userStats) {
  const hotScore = game.metadata.hotScore || 50;
  const usageCount = userStats[game.gameId] || 0;
  const maxUsage = Math.max(...Object.values(userStats), 1);
  const usageScore = (usageCount / maxUsage) * 100;
  return hotScore * 0.6 + usageScore * 0.4;
}
```

## 任务拆分

### Phase 1: 配置层统一化

- [ ] 1.1 迁移 `config-template-enhanced.js` 到 `config/games/_template.js`
- [ ] 1.2 重写 `genshin.js` 为增强版格式
- [ ] 1.3 重写 `starrail.js` 为增强版格式
- [ ] 1.4 更新 `config-loader.js` 显式注册所有游戏（`GAME_CONFIGS` 注册表）
- [ ] 1.5 修改 `services/game-service.js` 适配新字段结构
- [ ] 1.6 修改 `core/calculator/` 适配新字段结构
- [ ] 1.7 修改 `pages/planning/planning.js` 适配新字段结构
- [ ] 1.8 修改 `pages/overview/overview.js` 适配新字段结构
- [ ] 1.9 修改 `pages/history/history.js` 等引用配置的页面
- [ ] 1.10 删除旧的基础版配置文件和增强版示例文件
- [ ] 1.11 更新 `config-validator.js` 验证增强版配置结构
- [ ] 1.12 运行全量回归测试

### Phase 2: Game Selector 界面

- [ ] 2.1 新建 `pages/game-select/` 页面骨架
- [ ] 2.2 实现 `custom-nav-bar` + `themeClass` 绑定
- [ ] 2.3 实现搜索栏组件（实时过滤）
- [ ] 2.4 实现分类筛选 Tab
- [ ] 2.5 实现排序功能（热门/字母/最近使用）
- [ ] 2.6 实现游戏网格卡片（含缺省图标策略）
- [ ] 2.7 实现字母索引导航
- [ ] 2.8 实现热门/最近标记
- [ ] 2.9 替换 `overview.js` 中的 `wx.showActionSheet`
- [ ] 2.10 在 `app.json` 中注册新页面
- [ ] 2.11 深色模式样式适配
- [ ] 2.12 真机测试

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 全量修改配置字段导致计算器逻辑出错 | **高** | 增强版模板保留了所有核心参数，只是结构调整；全量回归测试覆盖所有计算器场景 |
| 游戏配置过多导致启动性能下降 | **中** | config-loader 按需加载；Game Selector 页面懒加载 |
| 缺省图标视觉效果不佳 | **低** | 为热门游戏优先配真实图标；缺省图标使用与游戏 ID 绑定的固定渐变色 |
| 字母索引在中文游戏名上效果差 | **中** | 使用 `metadata.sortKey`（拼音）作为索引键；中文名首字拼音归类 |

## 验收标准

- [ ] `config/games/` 下所有 `.js` 文件使用统一增强版格式
- [ ] `wx.showActionSheet` 完全被 Game Selector 页面替代
- [ ] 支持搜索、分类筛选、排序（热门/字母/最近使用）
- [ ] 缺省图标在浅色/深色模式下均正常显示
- [ ] 新增目标流程：overview → game-select → planning 无阻断
- [ ] 267 个 Jest 测试全部通过
- [ ] 真机测试：iOS/Android 深浅色模式正常
