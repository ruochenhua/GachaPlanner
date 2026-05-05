# Spec: Game Selector API

## 组件接口

### game-select-grid

```javascript
// properties
{
  games: Array,           // 过滤/排序后的游戏列表
  iconFailed: Object,     // { gameId: boolean } 图标加载失败标记
  themeClass: String      // 'dark-mode' | ''
}

// events
{
  tapgame: { detail: { gameId, gameName } }
}
```

### search-bar

```javascript
// properties
{
  placeholder: String,    // 默认: '搜索游戏名称...'
  themeClass: String
}

// events
{
  input: { detail: { value } },    // 防抖 150ms
  clear: {}                         // 点击清除按钮
}
```

### filter-tabs

```javascript
// properties
{
  categories: Array,      // [{ id, label, icon? }]
  activeId: String,       // 当前选中分类 id
  themeClass: String
}

// events
{
  change: { detail: { id } }
}
```

### letter-index

```javascript
// properties
{
  letters: Array,         // ['A', 'B', 'F', ...] 动态生成
  activeLetter: String,   // 当前可见分组的字母
  themeClass: String
}

// events
{
  tap: { detail: { letter } },     // 点击字母
  pan: { detail: { letter } }      // 拖动选择字母
}
```

## 页面数据接口

### game-select.js

```javascript
Page({
  data: {
    themeClass: '',
    games: [],              // 全部游戏（原始数据）
    filteredGames: [],      // 过滤后（用于渲染）
    categories: [
      { id: 'all', label: '全部' },
      { id: 'hot', label: '热门' },
      { id: 'featured', label: '推荐' },
      { id: 'RPG', label: 'RPG' },
      { id: 'action', label: '动作' },
      { id: 'strategy', label: '策略' },
      { id: 'card', label: '卡牌' },
      { id: 'casual', label: '休闲' }
    ],
    activeCategory: 'all',
    keyword: '',
    sortBy: 'hot',          // 'hot' | 'alpha' | 'recent'
    userStats: {},          // { gameId: usageCount }
    letterIndex: [],
    activeLetter: '',
    iconFailed: {},         // { gameId: true }
    loading: true
  },

  onLoad(options) {
    // options.mode: 'select' | 'switch'
    // options.gameId: 当前选中的游戏（switch 模式下高亮）
  },

  onShow() {
    themeService.apply();
  },

  // 搜索输入（防抖）
  onSearchInput(e) { ... },

  // 分类切换
  onCategoryChange(e) { ... },

  // 排序切换
  onSortChange(e) { ... },

  // 点击游戏卡片
  onGameTap(e) { ... },

  // 字母索引点击/拖动
  onLetterTap(e) { ... },
  onLetterPan(e) { ... },

  // 图标加载失败
  onIconError(e) { ... },

  // 计算排序分
  _calculateScore(game) { ... },

  // 过滤 + 排序 + 分组
  _filterAndSort() { ... },

  // 生成字母索引
  _buildLetterIndex(games) { ... },

  // 加载用户使用统计
  _loadUserStats() { ... }
});
```

## 排序算法

```javascript
function sortGames(games, sortBy, userStats) {
  const sorted = [...games];

  switch (sortBy) {
    case 'hot':
      sorted.sort((a, b) => {
        const scoreA = calculateScore(a, userStats);
        const scoreB = calculateScore(b, userStats);
        return scoreB - scoreA;
      });
      break;

    case 'alpha':
      sorted.sort((a, b) => a.metadata.sortKey.localeCompare(b.metadata.sortKey));
      break;

    case 'recent':
      // 按用户最后添加目标的时间排序
      sorted.sort((a, b) => {
        const timeA = userStats.lastAccessed?.[a.gameId] || 0;
        const timeB = userStats.lastAccessed?.[b.gameId] || 0;
        return timeB - timeA;
      });
      break;
  }

  return sorted;
}

function calculateScore(game, userStats) {
  const hotScore = game.metadata.hotScore || 50;
  const usageCount = userStats.usageCount?.[game.gameId] || 0;
  const maxUsage = Math.max(
    ...Object.values(userStats.usageCount || {}),
    1
  );
  const usageScore = (usageCount / maxUsage) * 100;
  return hotScore * 0.6 + usageScore * 0.4;
}
```

## 过滤逻辑

```javascript
function filterGames(games, keyword, category) {
  return games.filter(game => {
    // 分类过滤
    if (category === 'hot') {
      if (game.metadata.hotScore < 80) return false;
    } else if (category === 'featured') {
      if (!game.metadata.isFeatured) return false;
    } else if (category !== 'all') {
      if (game.metadata.category !== category) return false;
    }

    // 关键词过滤
    if (keyword) {
      const kw = keyword.toLowerCase();
      const matchName = game.name.includes(keyword);
      const matchPinyin = game.metadata.sortKey.includes(kw);
      const matchTag = game.metadata.tags.some(t => t.includes(keyword));
      return matchName || matchPinyin || matchTag;
    }

    return true;
  });
}
```

## 字母分组

```javascript
function groupByLetter(games) {
  const groups = {};

  for (const game of games) {
    const letter = game.metadata.sortKey[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(game);
  }

  // 按字母排序
  const sortedLetters = Object.keys(groups).sort();
  return sortedLetters.map(letter => ({
    letter,
    games: groups[letter]
  }));
}
```
