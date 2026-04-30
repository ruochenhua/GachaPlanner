/**
 * 历史记录表单组件
 * 用于创建新的抽卡历史记录
 */

const historyService = require('../../services/history-service');
const gameService = require('../../services/game-service');

Component({
  properties: {
    // 是否显示表单
    show: {
      type: Boolean,
      value: false
    },
    // 预填充的规划数据（可选）
    planData: {
      type: Object,
      value: null
    }
  },

  data: {
    // 游戏列表
    games: [],
    // 当前选中游戏
    selectedGameId: '',
    selectedGameName: '',
    // 卡池名称
    poolName: '',
    // 目标
    target: '',
    // 抽卡结果
    actualResult: 'success',
    // 抽卡抽数
    pullsUsed: 0,
    // 消耗资源
    resourcesUsed: 0,
    // 预测概率（从规划关联）
    predictedProbability: 0,
    // 是否有规划关联
    hasPlanLink: false,
    // 关联的规划ID
    linkedPlanId: null,
    // 表单验证错误
    errors: {},
    // 是否正在保存
    saving: false
  },

  lifetimes: {
    attached() {
      this.loadGames();
    }
  },

  observers: {
    'planData': function(planData) {
      if (planData) {
        this.fillFromPlan(planData);
      }
    }
  },

  methods: {
    /**
     * 加载游戏列表
     */
    loadGames() {
      const games = gameService.getGameConfigs();
      const gameList = Object.keys(games).map(id => ({
        id,
        name: games[id].name
      }));

      this.setData({
        games: gameList,
        selectedGameId: gameList[0]?.id || '',
        selectedGameName: gameList[0]?.name || ''
      });
    },

    /**
     * 从规划数据预填充
     * @param {Object} planData 规划数据
     */
    fillFromPlan(planData) {
      this.setData({
        selectedGameId: planData.gameId || '',
        selectedGameName: planData.gameName || '',
        poolName: planData.poolName || '',
        target: planData.target || '',
        predictedProbability: planData.probability || 0,
        hasPlanLink: true,
        linkedPlanId: planData.id || null
      });
    },

    /**
     * 游戏选择变更
     * @param {Event} e 事件对象
     */
    onGameChange(e) {
      const gameId = e.detail.value;
      const game = this.data.games.find(g => g.id === gameId);

      if (game) {
        this.setData({
          selectedGameId: gameId,
          selectedGameName: game.name,
          // 清空卡池和目标（切换游戏时）
          poolName: '',
          target: ''
        });
      }
    },

    /**
     * 卡池名称输入
     * @param {Event} e 事件对象
     */
    onPoolNameInput(e) {
      this.setData({
        poolName: e.detail.value
      });
    },

    /**
     * 目标输入
     * @param {Event} e 事件对象
     */
    onTargetInput(e) {
      this.setData({
        target: e.detail.value
      });
    },

    /**
     * 抽卡结果切换
     * @param {Event} e 事件对象
     */
    onResultChange(e) {
      const result = e.currentTarget.dataset.result;
      this.setData({
        actualResult: result
      });
    },

    /**
     * 抽卡抽数输入
     * @param {Event} e 事件对象
     */
    onPullsInput(e) {
      const value = parseInt(e.detail.value) || 0;
      this.setData({
        pullsUsed: value
      });
    },

    /**
     * 资源消耗输入
     * @param {Event} e 事件对象
     */
    onResourcesInput(e) {
      const value = parseInt(e.detail.value) || 0;
      this.setData({
        resourcesUsed: value
      });
    },

    /**
     * 解除规划关联
     */
    unlinkPlan() {
      this.setData({
        hasPlanLink: false,
        linkedPlanId: null,
        predictedProbability: 0
      });
    },

    /**
     * 验证表单
     * @returns {Object|null} 错误信息或null
     */
    validateForm() {
      const errors = {};

      if (!this.data.selectedGameId) {
        errors.gameId = '请选择游戏';
      }

      if (!this.data.poolName.trim()) {
        errors.poolName = '请输入卡池名称';
      }

      if (this.data.pullsUsed < 0) {
        errors.pullsUsed = '抽数不能为负数';
      }

      if (this.data.resourcesUsed < 0) {
        errors.resourcesUsed = '资源消耗不能为负数';
      }

      this.setData({ errors });

      return Object.keys(errors).length > 0 ? errors : null;
    },

    /**
     * 提交保存
     */
    async onSubmit() {
      // 验证表单
      const errors = this.validateForm();
      if (errors) {
        wx.showToast({
          title: '请检查表单填写',
          icon: 'none'
        });
        return;
      }

      // 设置保存状态
      this.setData({ saving: true });

      // 构建记录数据
      const record = {
        gameId: this.data.selectedGameId,
        gameName: this.data.selectedGameName,
        poolName: this.data.poolName,
        target: this.data.target,
        predictedProbability: this.data.predictedProbability,
        actualResult: this.data.actualResult,
        pullsUsed: this.data.pullsUsed,
        resourcesUsed: this.data.resourcesUsed
      };

      // 调用服务保存
      const result = historyService.saveRecord(record);

      if (result.success) {
        wx.showToast({
          title: '记录已保存',
          icon: 'success'
        });

        // 触发事件通知父组件
        this.triggerEvent('saved', { record: result.data });

        // 重置表单
        this.resetForm();
      } else {
        wx.showToast({
          title: result.error || '保存失败',
          icon: 'none'
        });
      }

      this.setData({ saving: false });
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.setData({
        poolName: '',
        target: '',
        actualResult: 'success',
        pullsUsed: 0,
        resourcesUsed: 0,
        predictedProbability: 0,
        hasPlanLink: false,
        linkedPlanId: null,
        errors: {}
      });
    },

    /**
     * 关闭表单
     */
    onClose() {
      this.triggerEvent('close');
    }
  }
});