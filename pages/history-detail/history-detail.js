/**
 * 历史记录详情页
 * 支持查看、编辑和删除历史记录
 */

const historyService = require('../../services/history-service');
const gameService = require('../../services/game-service');
const { formatDateTime, formatRelativeTime } = require('../../utils/time');

Page({
  data: {
    // 记录ID
    recordId: '',
    // 记录数据
    record: null,
    // 是否编辑模式
    isEditMode: false,
    // 游戏列表
    games: [],
    // 编辑表单数据
    formData: {
      gameId: '',
      gameName: '',
      poolName: '',
      target: '',
      actualResult: 'success',
      pullsUsed: 0,
      resourcesUsed: 0,
      predictedProbability: 0
    },
    // 时间显示
    createdAtText: '',
    updatedAtText: '',
    // 是否正在保存
    saving: false,
    // 是否正在删除
    deleting: false
  },

  onLoad(options) {
    const { id, mode } = options;

    if (!id) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({
      recordId: id,
      isEditMode: mode === 'edit'
    });

    this.loadGames();
    this.loadRecord();
  },

  /**
   * 加载游戏列表
   */
  loadGames() {
    const games = gameService.getGameConfigs();
    const gameList = Object.keys(games).map(id => ({
      id,
      name: games[id].name
    }));

    this.setData({ games: gameList });
  },

  /**
   * 加载记录数据
   */
  loadRecord() {
    const result = historyService.getRecordById(this.data.recordId);

    if (result.success) {
      const record = result.data;

      this.setData({
        record,
        formData: {
          gameId: record.gameId,
          gameName: record.gameName,
          poolName: record.poolName,
          target: record.target,
          actualResult: record.actualResult,
          pullsUsed: record.pullsUsed,
          resourcesUsed: record.resourcesUsed,
          predictedProbability: record.predictedProbability
        },
        createdAtText: formatDateTime(record.createdAt),
        updatedAtText: formatRelativeTime(record.updatedAt)
      });

      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: this.data.isEditMode ? '编辑记录' : '记录详情'
      });
    } else {
      wx.showToast({
        title: result.error || '加载失败',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode
    });

    wx.setNavigationBarTitle({
      title: this.data.isEditMode ? '编辑记录' : '记录详情'
    });
  },

  /**
   * 游戏选择变更
   */
  onGameChange(e) {
    const index = e.detail.value;
    const game = this.data.games[index];

    this.setData({
      'formData.gameId': game.id,
      'formData.gameName': game.name
    });
  },

  /**
   * 卡池名称输入
   */
  onPoolNameInput(e) {
    this.setData({ 'formData.poolName': e.detail.value });
  },

  /**
   * 目标输入
   */
  onTargetInput(e) {
    this.setData({ 'formData.target': e.detail.value });
  },

  /**
   * 抽卡结果切换
   */
  onResultChange(e) {
    const result = e.currentTarget.dataset.result;
    this.setData({ 'formData.actualResult': result });
  },

  /**
   * 抽卡抽数输入
   */
  onPullsInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({ 'formData.pullsUsed': value });
  },

  /**
   * 资源消耗输入
   */
  onResourcesInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({ 'formData.resourcesUsed': value });
  },

  /**
   * 预测概率输入
   */
  onProbabilityInput(e) {
    let value = parseInt(e.detail.value) || 0;
    value = Math.max(0, Math.min(100, value));
    this.setData({ 'formData.predictedProbability': value });
  },

  /**
   * 保存编辑
   */
  onSave() {
    this.setData({ saving: true });

    const updates = {
      gameId: this.data.formData.gameId,
      gameName: this.data.formData.gameName,
      poolName: this.data.formData.poolName,
      target: this.data.formData.target,
      actualResult: this.data.formData.actualResult,
      pullsUsed: this.data.formData.pullsUsed,
      resourcesUsed: this.data.formData.resourcesUsed,
      predictedProbability: this.data.formData.predictedProbability
    };

    const result = historyService.updateRecord(this.data.recordId, updates);

    if (result.success) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      this.setData({
        isEditMode: false,
        record: result.data
      });

      wx.setNavigationBarTitle({
        title: '记录详情'
      });
    } else {
      wx.showToast({
        title: result.error || '保存失败',
        icon: 'none'
      });
    }

    this.setData({ saving: false });
  },

  /**
   * 取消编辑
   */
  onCancel() {
    // 恢复原始数据
    const record = this.data.record;
    this.setData({
      isEditMode: false,
      formData: {
        gameId: record.gameId,
        gameName: record.gameName,
        poolName: record.poolName,
        target: record.target,
        actualResult: record.actualResult,
        pullsUsed: record.pullsUsed,
        resourcesUsed: record.resourcesUsed,
        predictedProbability: record.predictedProbability
      }
    });

    wx.setNavigationBarTitle({
      title: '记录详情'
    });
  },

  /**
   * 删除记录
   */
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后30秒内可撤销',
      confirmColor: '#C47070',
      success: (res) => {
        if (res.confirm) {
          this.setData({ deleting: true });

          const result = historyService.deleteRecord(this.data.recordId, true);

          if (result.success) {
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });

            // 返回上一页
            setTimeout(() => wx.navigateBack(), 1000);
          } else {
            wx.showToast({
              title: result.error || '删除失败',
              icon: 'none'
            });
          }

          this.setData({ deleting: false });
        }
      }
    });
  }
});