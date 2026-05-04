/**
 * Game Select Utils 单元测试
 * 覆盖过滤、排序、字母索引生成等核心逻辑
 */

const {
  calculateHotScore,
  filterGames,
  sortGames,
  generateLetterIndex,
  extractCategories,
  applyFilterAndSort
} = require('../../utils/game-select-utils');

// 测试数据工厂
function createMockGame(overrides = {}) {
  return {
    gameId: 'genshin',
    name: '原神',
    metadata: {
      category: 'RPG',
      tags: ['开放世界', '二次元'],
      hotScore: 95,
      isFeatured: true,
      sortKey: 'yuanshen'
    },
    ...overrides
  };
}

const mockGames = [
  createMockGame({ gameId: 'genshin', name: '原神', metadata: { category: 'RPG', tags: ['开放世界', '二次元'], hotScore: 95, isFeatured: true, sortKey: 'yuanshen' } }),
  createMockGame({ gameId: 'starrail', name: '崩坏：星穹铁道', metadata: { category: 'RPG', tags: ['回合制', '科幻'], hotScore: 90, isFeatured: true, sortKey: 'bengtie' } }),
  createMockGame({ gameId: 'arknights', name: '明日方舟', metadata: { category: '策略', tags: ['塔防', '二次元'], hotScore: 80, isFeatured: false, sortKey: 'mingrifangzhou' } }),
  createMockGame({ gameId: 'fgo', name: 'Fate/Grand Order', metadata: { category: '卡牌', tags: ['回合制', 'Fate'], hotScore: 70, isFeatured: false, sortKey: 'fgo' } }),
  createMockGame({ gameId: 'hok', name: '王者荣耀', metadata: { category: '动作', tags: ['MOBA', '竞技'], hotScore: 88, isFeatured: false, sortKey: 'wangzherongyao' } }),
  createMockGame({ gameId: 'onmyoji', name: '阴阳师', metadata: { category: '卡牌', tags: ['回合制', '和风'], hotScore: 60, isFeatured: false, sortKey: 'yin yang shi' } })
];

describe('calculateHotScore', () => {
  test('无使用记录时只返回全局热度分数的 60%', () => {
    const game = mockGames[0]; // hotScore = 95
    const stats = {};
    expect(calculateHotScore(game, stats)).toBeCloseTo(95 * 0.6, 5);
  });

  test('有使用记录时混合计算全局热度 + 个人偏好', () => {
    const game = mockGames[0];
    const stats = {
      usageCount: { genshin: 10, starrail: 5 }
    };
    // maxUsage = 10, usageScore = (10/10)*100 = 100
    // result = 95*0.6 + 100*0.4 = 57 + 40 = 97
    expect(calculateHotScore(game, stats)).toBeCloseTo(97, 5);
  });

  test('个人使用较少时分数低于全局热度', () => {
    const game = mockGames[0];
    const stats = {
      usageCount: { genshin: 1, starrail: 10 }
    };
    // maxUsage = 10, usageScore = (1/10)*100 = 10
    // result = 95*0.6 + 10*0.4 = 57 + 4 = 61
    expect(calculateHotScore(game, stats)).toBeCloseTo(61, 5);
  });

  test('缺失 metadata.hotScore 时使用默认值 50', () => {
    const game = createMockGame({ metadata: { sortKey: 'test' } });
    expect(calculateHotScore(game, {})).toBeCloseTo(50 * 0.6, 5);
  });
});

describe('filterGames', () => {
  test('无过滤条件时返回全部游戏', () => {
    const result = filterGames(mockGames, '', 'all');
    expect(result).toHaveLength(mockGames.length);
  });

  test('按分类 "featured" 过滤只返回推荐游戏', () => {
    const result = filterGames(mockGames, '', 'featured');
    expect(result).toHaveLength(2);
    expect(result.map(g => g.gameId)).toEqual(['genshin', 'starrail']);
  });

  test('按具体分类过滤', () => {
    const result = filterGames(mockGames, '', '卡牌');
    expect(result).toHaveLength(2);
    expect(result.map(g => g.gameId)).toContain('fgo');
    expect(result.map(g => g.gameId)).toContain('onmyoji');
  });

  test('按关键词搜索游戏名称（中文）', () => {
    const result = filterGames(mockGames, '原神', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].gameId).toBe('genshin');
  });

  test('按关键词搜索游戏名称（英文，不区分大小写）', () => {
    const result = filterGames(mockGames, 'FATE', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].gameId).toBe('fgo');
  });

  test('按拼音 sortKey 搜索', () => {
    const result = filterGames(mockGames, 'bengtie', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].gameId).toBe('starrail');
  });

  test('按标签搜索', () => {
    const result = filterGames(mockGames, '塔防', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].gameId).toBe('arknights');
  });

  test('搜索无结果时返回空数组', () => {
    const result = filterGames(mockGames, '不存在的游戏', 'all');
    expect(result).toHaveLength(0);
  });

  test('同时应用分类和关键词过滤', () => {
    const result = filterGames(mockGames, '回合制', '卡牌');
    expect(result).toHaveLength(2);
    expect(result.map(g => g.gameId)).toContain('fgo');
    expect(result.map(g => g.gameId)).toContain('onmyoji');
  });
});

describe('sortGames', () => {
  test('按热门排序：高热度游戏排在前面', () => {
    const stats = {};
    const sorted = sortGames(mockGames, 'hot', stats);
    expect(sorted[0].gameId).toBe('genshin'); // hotScore 95
    expect(sorted[1].gameId).toBe('starrail'); // hotScore 90
  });

  test('按字母排序：按 sortKey 字母顺序', () => {
    const sorted = sortGames(mockGames, 'alpha', {});
    expect(sorted[0].gameId).toBe('starrail'); // sortKey: 'bengtie'
    expect(sorted[1].gameId).toBe('fgo'); // sortKey: 'fgo'
    expect(sorted[sorted.length - 1].gameId).toBe('genshin'); // sortKey: 'yuanshen'
  });

  test('按最近使用排序：最近访问的游戏排在前面', () => {
    const stats = {
      lastAccessed: {
        genshin: 1000,
        starrail: 3000,
        arknights: 2000
      }
    };
    const sorted = sortGames(mockGames, 'recent', stats);
    expect(sorted[0].gameId).toBe('starrail'); // 3000
    expect(sorted[1].gameId).toBe('arknights'); // 2000
    expect(sorted[2].gameId).toBe('genshin'); // 1000
  });

  test('按最近使用排序：无记录的游戏排在最后', () => {
    const stats = { lastAccessed: { genshin: 1000 } };
    const sorted = sortGames(mockGames, 'recent', stats);
    expect(sorted[0].gameId).toBe('genshin');
    // 其余游戏 lastAccessed = 0，排在后面
  });
});

describe('generateLetterIndex', () => {
  test('从 sortKey 提取首字母并去重排序', () => {
    const letters = generateLetterIndex(mockGames);
    expect(letters).toContain('Y'); // yuanshen
    expect(letters).toContain('B'); // bengtie
    expect(letters).toContain('M'); // mingrifangzhou
    expect(letters).toContain('F'); // fgo
    expect(letters).toContain('W'); // wangzherongyao
    expect(letters).toEqual([...letters].sort()); // 已排序
  });

  test('无 sortKey 时回退到 gameId 首字母', () => {
    const games = [{ gameId: 'abc', metadata: {} }];
    const letters = generateLetterIndex(games);
    expect(letters).toEqual(['A']);
  });

  test('空数组返回空数组', () => {
    expect(generateLetterIndex([])).toEqual([]);
  });
});

describe('extractCategories', () => {
  test('动态提取游戏中存在的分类', () => {
    const categories = extractCategories(mockGames);
    expect(categories).toContainEqual({ id: 'RPG', label: 'RPG' });
    expect(categories).toContainEqual({ id: '策略', label: '策略' });
    expect(categories).toContainEqual({ id: '卡牌', label: '卡牌' });
    expect(categories).toContainEqual({ id: '动作', label: '动作' });
  });

  test('预设分类中无对应游戏时被过滤掉', () => {
    // mockGames 中没有 '休闲' 分类的游戏
    const categories = extractCategories(mockGames);
    const leisure = categories.find(c => c.id === '休闲');
    expect(leisure).toBeUndefined();
  });
});

describe('applyFilterAndSort', () => {
  test('集成测试：搜索 + 分类 + 排序', () => {
    const { filteredGames, letterIndex } = applyFilterAndSort(
      mockGames,
      '回合制',
      '卡牌',
      'hot',
      {}
    );
    expect(filteredGames).toHaveLength(2);
    expect(filteredGames[0].gameId).toBe('fgo'); // hotScore 70 vs 60
    expect(letterIndex).toContain('F');
    expect(letterIndex).toContain('Y');
  });

  test('空结果时 letterIndex 也为空', () => {
    const { filteredGames, letterIndex } = applyFilterAndSort(
      mockGames,
      '不存在',
      'all',
      'hot',
      {}
    );
    expect(filteredGames).toHaveLength(0);
    expect(letterIndex).toHaveLength(0);
  });
});
