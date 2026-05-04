/**
 * 游戏选择器工具函数
 * 纯函数，不依赖小程序环境，便于单元测试
 */

const DEFAULT_HOT_SCORE = 50;
const HOT_WEIGHT = 0.6;
const USAGE_WEIGHT = 0.4;

/**
 * 计算游戏热度分数（全局热度 + 个人使用偏好）
 * @param {Object} game - 游戏配置对象
 * @param {Object} userStats - 用户使用统计
 * @returns {number} 热度分数 0-100
 */
function calculateHotScore(game, userStats) {
  const hotScore = game.metadata?.hotScore || DEFAULT_HOT_SCORE;
  const usageCount = userStats?.usageCount?.[game.gameId] || 0;
  const maxUsage = Math.max(...Object.values(userStats?.usageCount || {}), 1);
  const usageScore = (usageCount / maxUsage) * 100;
  return hotScore * HOT_WEIGHT + usageScore * USAGE_WEIGHT;
}

/**
 * 过滤游戏列表
 * @param {Array} games - 游戏列表
 * @param {string} keyword - 搜索关键词
 * @param {string} category - 分类ID
 * @returns {Array} 过滤后的游戏列表
 */
function filterGames(games, keyword, category) {
  return games.filter(game => {
    // 分类过滤
    if (category === 'featured') {
      if (!game.metadata?.isFeatured) return false;
    } else if (category !== 'all') {
      if (game.metadata?.category !== category) return false;
    }

    // 关键词过滤
    if (keyword) {
      const kw = keyword.toLowerCase();
      const matchName = game.name?.toLowerCase()?.includes(kw);
      const matchPinyin = game.metadata?.sortKey?.includes(kw);
      const matchTag = game.metadata?.tags?.some(t => t.toLowerCase().includes(kw));
      return matchName || matchPinyin || matchTag;
    }

    return true;
  });
}

/**
 * 排序游戏列表
 * @param {Array} games - 游戏列表
 * @param {string} sortBy - 排序方式: hot | alpha | recent
 * @param {Object} userStats - 用户使用统计
 * @returns {Array} 排序后的游戏列表（新数组）
 */
function sortGames(games, sortBy, userStats) {
  const sorted = [...games];
  switch (sortBy) {
    case 'hot':
      sorted.sort((a, b) => calculateHotScore(b, userStats) - calculateHotScore(a, userStats));
      break;
    case 'alpha':
      sorted.sort((a, b) => (a.metadata?.sortKey || '').localeCompare(b.metadata?.sortKey || ''));
      break;
    case 'recent':
      sorted.sort((a, b) => {
        const timeA = userStats?.lastAccessed?.[a.gameId] || 0;
        const timeB = userStats?.lastAccessed?.[b.gameId] || 0;
        return timeB - timeA;
      });
      break;
  }
  return sorted;
}

/**
 * 从游戏列表生成字母索引
 * @param {Array} games - 游戏列表
 * @returns {Array<string>} 排序后的首字母数组
 */
function generateLetterIndex(games) {
  const letterSet = new Set();
  games.forEach(g => {
    const first = (g.metadata?.sortKey || g.gameId)?.[0]?.toUpperCase();
    if (first) letterSet.add(first);
  });
  return Array.from(letterSet).sort();
}

/**
 * 从游戏列表动态提取分类
 * @param {Array} games - 游戏列表
 * @returns {Array<{id: string, label: string}>} 分类列表
 */
function extractCategories(games) {
  const categorySet = new Set(['RPG', '动作', '策略', '卡牌', '休闲']);
  games.forEach(g => {
    if (g.metadata?.category) categorySet.add(g.metadata.category);
  });
  return Array.from(categorySet)
    .filter(c => games.some(g => g.metadata?.category === c))
    .map(c => ({ id: c, label: c }));
}

/**
 * 完整的过滤+排序流程
 * @param {Array} games - 全部游戏列表
 * @param {string} keyword - 搜索关键词
 * @param {string} category - 分类ID
 * @param {string} sortBy - 排序方式
 * @param {Object} userStats - 用户使用统计
 * @returns {{filteredGames: Array, letterIndex: Array<string>}}
 */
function applyFilterAndSort(games, keyword, category, sortBy, userStats) {
  const filtered = filterGames(games, keyword, category);
  const sorted = sortGames(filtered, sortBy, userStats);
  const letterIndex = generateLetterIndex(sorted);
  return { filteredGames: sorted, letterIndex };
}

module.exports = {
  calculateHotScore,
  filterGames,
  sortGames,
  generateLetterIndex,
  extractCategories,
  applyFilterAndSort
};
