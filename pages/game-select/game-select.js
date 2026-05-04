const themeService = require('../../services/theme-service');
const { applyFilterAndSort, extractCategories } = require('../../utils/game-select-utils');

const SORT_ICONS = {
  hot: '🔥',
  alpha: '🔤',
  recent: '🕐'
};

const SORT_LABELS = {
  hot: '热门排序',
  alpha: '字母排序',
  recent: '最近使用'
};

Page({
  data: {
    themeClass: '',
    games: [],
    filteredGames: [],
    categories: [
      { id: 'all', label: '全部' },
      { id: 'featured', label: '推荐 ⭐' }
    ],
    activeCategory: 'all',
    keyword: '',
    sortBy: 'hot',
    sortIcon: SORT_ICONS.hot,
    userStats: {},
    letterIndex: [],
    iconFailed: {},
    loading: true
  },

  onLoad() {
    this._loadGames();
    this._loadUserStats();
    this._loadSortPreference();
  },

  onShow() {
    themeService.apply();
  },

  _loadGames() {
    const configLoader = require('../../config/config-loader');
    const allGamesResult = configLoader.loadAllGames();
    
    if (allGamesResult.success) {
      const games = Object.values(allGamesResult.data);
      // 动态提取分类
      const categorySet = new Set(['RPG', '动作', '策略', '卡牌', '休闲']);
      games.forEach(g => {
        if (g.metadata?.category) categorySet.add(g.metadata.category);
      });
      const dynamicCategories = extractCategories(games);
      
      this.setData({
        games,
        categories: [
          { id: 'all', label: '全部' },
          { id: 'featured', label: '推荐 ⭐' },
          ...dynamicCategories
        ],
        loading: false
      });
      this._applyFilterAndSort();
    }
  },

  _loadUserStats() {
    try {
      const stats = wx.getStorageSync('gp_user_game_stats') || {};
      this.setData({ userStats: stats });
    } catch (e) {
      this.setData({ userStats: {} });
    }
  },

  _loadSortPreference() {
    try {
      const sortBy = wx.getStorageSync('gp_game_select_sort_by') || 'hot';
      this.setData({
        sortBy,
        sortIcon: SORT_ICONS[sortBy]
      });
    } catch (e) {
      // use default
    }
  },

  _applyFilterAndSort() {
    const { games, keyword, activeCategory, sortBy, userStats } = this.data;
    const { filteredGames, letterIndex } = applyFilterAndSort(
      games, keyword, activeCategory, sortBy, userStats
    );
    this.setData({ filteredGames, letterIndex });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this._applyFilterAndSort();
  },

  onCategoryChange(e) {
    this.setData({ activeCategory: e.detail.id });
    this._applyFilterAndSort();
  },

  onSortToggle() {
    const sortOrder = ['hot', 'alpha', 'recent'];
    const currentIdx = sortOrder.indexOf(this.data.sortBy);
    const nextSort = sortOrder[(currentIdx + 1) % sortOrder.length];
    wx.setStorageSync('gp_game_select_sort_by', nextSort);
    this.setData({
      sortBy: nextSort,
      sortIcon: SORT_ICONS[nextSort]
    });
    this._applyFilterAndSort();
  },

  onGameTap(e) {
    const { gameId } = e.detail;
    // 更新使用统计
    const userStats = this.data.userStats;
    if (!userStats.usageCount) userStats.usageCount = {};
    if (!userStats.lastAccessed) userStats.lastAccessed = {};
    userStats.usageCount[gameId] = (userStats.usageCount[gameId] || 0) + 1;
    userStats.lastAccessed[gameId] = Date.now();
    wx.setStorageSync('gp_user_game_stats', userStats);
    
    wx.redirectTo({
      url: `/pages/planning/planning?gameId=${gameId}&autoFocusTarget=true`
    });
  },

  onIconError(e) {
    const { gameId } = e.detail;
    this.setData({
      [`iconFailed.${gameId}`]: true
    });
  },

  onLetterTap(e) {
    const { letter } = e.detail;
    // 找到该字母下第一个游戏
    const targetGame = this.data.filteredGames.find(g => {
      const first = (g.metadata?.sortKey || g.gameId)?.[0]?.toUpperCase();
      return first === letter;
    });
    if (targetGame) {
      wx.pageScrollTo({
        selector: `#game-${targetGame.gameId}`,
        duration: 300,
        offsetTop: -180
      });
    }
  }
});
