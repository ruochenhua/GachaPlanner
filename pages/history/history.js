/**
 * 抽卡历史页面
 * 展示用户的抽卡历史记录列表
 */

const historyService = require('../../services/history-service');
const gameService = require('../../services/game-service');

Page({
  data: {
    // 历史记录列表
    records: [],
    // 是否正在加载
    loading: false,
    // 是否有更多数据
    hasMore: true,
    // 当前页码
    page: 0,
    // 每页数量
    pageSize: 20,
    // 总记录数
    total: 0,
    // 游戏筛选列表
    gameFilterList: [{ id: '', name: '全部游戏' }],
    // 当前筛选游戏
    currentGameFilter: '',
    // 是否显示表单
    showForm: false,
    // 空数据提示
    emptyTips: '暂无历史记录'
  },

  onLoad() {
    this.loadGameFilterList();
    this.loadHistory();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshHistory();
  },

  /**
   * 加载游戏筛选列表
   */
  loadGameFilterList() {
    const games = gameService.getGameConfigs();
    const gameList = Object.keys(games).map(id => ({
      id,
      name: games[id].name
    }));

    this.setData({
      gameFilterList: [{ id: '', name: '全部游戏' }, ...gameList]
    });
  },

  /**
   * 加载历史记录
   */
  loadHistory() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const options = {
      gameId: this.data.currentGameFilter || undefined,
      offset: this.data.page * this.data.pageSize,
      limit: this.data.pageSize
    };

    const result = historyService.loadHistory(options);

    if (result.success) {
      const { records, total } = result.data;

      this.setData({
        records: [...this.data.records, ...records],
        total,
        hasMore: records.length >= this.data.pageSize,
        loading: false,
        page: this.data.page + 1,
        emptyTips: total === 0 ? '暂无历史记录' : ''
      });
    } else {
      this.setData({
        loading: false,
        emptyTips: '加载失败，请重试'
      });

      wx.showToast({
        title: result.error || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 刷新历史记录
   */
  refreshHistory() {
    historyService.clearCache();

    this.setData({
      records: [],
      page: 0,
      hasMore: true
    });

    this.loadHistory();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.refreshHistory();
    wx.stopPullDownRefresh();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadHistory();
    }
  },

  /**
   * 游戏筛选变更
   * @param {Event} e 事件对象
   */
  onGameFilterChange(e) {
    const index = e.detail.value;
    const game = this.data.gameFilterList[index];

    this.setData({
      currentGameFilter: game.id,
      records: [],
      page: 0,
      hasMore: true
    });

    this.loadHistory();
  },

  /**
   * 显示添加表单
   */
  showAddForm() {
    this.setData({ showForm: true });
  },

  /**
   * 关闭表单
   */
  closeForm() {
    this.setData({ showForm: false });
  },

  /**
   * 表单保存成功
   */
  onRecordSaved() {
    this.setData({ showForm: false });
    this.refreshHistory();

    wx.showToast({
      title: '记录已保存',
      icon: 'success'
    });
  },

  /**
   * 点击历史记录卡片
   * @param {Event} e 事件对象
   */
  onCardTap(e) {
    const { record } = e.detail;

    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/history-detail/history-detail?id=${record.id}`
    });
  },

  /**
   * 长按历史记录卡片
   * @param {Event} e 事件对象
   */
  onCardLongPress(e) {
    const { record } = e.detail;

    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑
          wx.navigateTo({
            url: `/pages/history-detail/history-detail?id=${record.id}&mode=edit`
          });
        } else if (res.tapIndex === 1) {
          // 删除
          this.deleteRecord(record.id);
        }
      }
    });
  },

  /**
   * 删除记录
   * @param {string} id 记录ID
   */
  deleteRecord(id) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后30秒内可撤销',
      success: (res) => {
        if (res.confirm) {
          const result = historyService.deleteRecord(id, true);

          if (result.success) {
            this.refreshHistory();

            wx.showToast({
              title: '已删除',
              icon: 'none'
            });

            // 显示撤销提示
            this.showUndoToast(id);
          } else {
            wx.showToast({
              title: result.error || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 显示撤销提示
   * @param {string} id 记录ID
   */
  showUndoToast(id) {
    // TODO: 实现撤销功能（30秒内）
    // 可以使用自定义Toast组件来实现撤销功能
  }
});