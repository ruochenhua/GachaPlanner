// pages/planning-data/planning-data.js
// 规划数据管理页面

const PlanningStorage = require('../../services/planning-storage');
const gameService = require('../../services/game-service');

Page({
  data: {
    planningDataList: [],
    showDeleteModal: false,
    showClearAllModal: false,
    selectedGameId: '',
    selectedGameName: ''
  },

  onShow() {
    this.loadPlanningDataList();
  },

  /**
   * 加载规划数据列表
   */
  async loadPlanningDataList() {
    try {
      const result = await PlanningStorage.getAllPlanningData();

      if (!result.success) {
        console.error('加载规划数据失败:', result.error);
        return;
      }

      const dataList = result.data.map(item => {
        const gameConfig = gameService.getGameConfig(item.gameId);
        const resources = item.data.resources || {};
        const poolTimeRange = item.data.poolTimeRange || {};
        const dailyIncome = item.data.dailyIncome || {};

        // 格式化资源摘要
        const resourcesSummary = this.formatResourcesSummary(resources, item.data.totalPulls);

        // 格式化卡池时间
        const hasPoolTime = !!poolTimeRange.startDate && !!poolTimeRange.endDate;
        const poolTimeSummary = hasPoolTime
          ? `${poolTimeRange.startDate} ~ ${poolTimeRange.endDate}`
          : '';

        // 格式化每日收入
        const hasDailyIncome = dailyIncome.primogems > 0;
        const dailyIncomeSummary = hasDailyIncome
          ? `${dailyIncome.primogems} 原石/天`
          : '';

        // 格式化最后保存时间
        const lastSavedAt = item.data.metadata?.lastSavedAt
          ? this.formatDate(item.data.metadata.lastSavedAt)
          : '未知';

        return {
          gameId: item.gameId,
          gameName: gameConfig?.success ? gameConfig.data.name : item.gameId,
          resourcesSummary,
          hasPoolTime,
          poolTimeSummary,
          hasDailyIncome,
          dailyIncomeSummary,
          lastSavedAt,
          rawData: item.data
        };
      });

      this.setData({ planningDataList: dataList });
    } catch (err) {
      console.error('加载规划数据异常:', err);
    }
  },

  /**
   * 格式化资源摘要
   */
  formatResourcesSummary(resources, totalPulls) {
    const parts = [];

    if (resources.primogems > 0) {
      parts.push(`${resources.primogems} 原石`);
    }
    if (resources.intertwinedFates > 0) {
      parts.push(`${resources.intertwinedFates} 纠缠`);
    }
    if (resources.acquaintFates > 0) {
      parts.push(`${resources.acquaintFates} 相遇`);
    }
    if (resources.currentPity > 0) {
      parts.push(`保底 ${resources.currentPity}`);
    }

    if (parts.length === 0) {
      return '暂无资源';
    }

    return parts.join(', ');
  },

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const diffMinutes = Math.floor(diff / 60000);
      const diffHours = Math.floor(diff / 3600000);
      const diffDays = Math.floor(diff / 86400000);

      if (diffMinutes < 60) {
        return `${diffMinutes} 分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours} 小时前`;
      } else if (diffDays < 7) {
        return `${diffDays} 天前`;
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (err) {
      return '未知';
    }
  },

  /**
   * 点击数据项
   */
  onDataItemTap(e) {
    const gameId = e.currentTarget.dataset.gameId;
    // 跳转到规划页
    wx.navigateTo({
      url: `/pages/planning/planning?gameId=${gameId}`
    });
  },

  /**
   * 点击删除按钮
   */
  onDeleteData(e) {
    const gameId = e.currentTarget.dataset.gameId;
    const item = this.data.planningDataList.find(d => d.gameId === gameId);

    this.setData({
      selectedGameId: gameId,
      selectedGameName: item?.gameName || gameId,
      showDeleteModal: true
    });
  },

  /**
   * 关闭删除确认框
   */
  closeModal() {
    this.setData({
      showDeleteModal: false,
      selectedGameId: '',
      selectedGameName: ''
    });
  },

  /**
   * 确认删除
   */
  async confirmDelete() {
    try {
      const result = await PlanningStorage.deletePlanningData(this.data.selectedGameId);

      if (result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.loadPlanningDataList();
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('删除失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }

    this.closeModal();
  },

  /**
   * 点击清空所有按钮
   */
  onClearAll() {
    this.setData({
      showClearAllModal: true
    });
  },

  /**
   * 关闭清空所有确认框
   */
  closeClearAllModal() {
    this.setData({
      showClearAllModal: false
    });
  },

  /**
   * 确认清空所有
   */
  async confirmClearAll() {
    try {
      const result = await PlanningStorage.clearAllData();

      if (result.success) {
        wx.showToast({
          title: '已清空所有数据',
          icon: 'success'
        });
        this.loadPlanningDataList();
      } else {
        wx.showToast({
          title: '清空失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('清空失败:', err);
      wx.showToast({
        title: '清空失败',
        icon: 'none'
      });
    }

    this.closeClearAllModal();
  }
});
