/**
 * 规划时间轴组件
 * 横向展示多卡池规划的时间节点
 */

Component({
  properties: {
    // 规划数据列表
    plans: {
      type: Array,
      value: []
    }
  },

  data: {
    // 时间轴节点列表
    nodes: [],
    // 当前节点索引
    currentIndex: -1,
    // 滚动位置
    scrollLeft: 0
  },

  observers: {
    'plans': function(plans) {
      if (plans && plans.length > 0) {
        this.processPlans(plans);
      }
    }
  },

  lifetimes: {
    attached() {
      // 监听当前时间更新
      this.timer = setInterval(() => {
        this.updateCurrentNode();
      }, 60000); // 每分钟更新
    },

    detached() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  },

  methods: {
    /**
     * 处理规划数据生成节点
     * @param {Array} plans 规划数据列表
     */
    processPlans(plans) {
      const now = Date.now();

      // 按时间排序
      const sortedPlans = [...plans].sort((a, b) => {
        const timeA = a.targetDate || a.createdAt;
        const timeB = b.targetDate || b.createdAt;
        return timeA - timeB;
      });

      // 生成节点数据
      const nodes = sortedPlans.map((plan, index) => {
        const targetTime = plan.targetDate || plan.createdAt;
        const status = this.getNodeStatus(targetTime, now);

        return {
          id: plan.id || index,
          planId: plan.id,
          date: this.formatNodeDate(targetTime),
          gameId: plan.gameId,
          gameName: plan.gameName,
          poolName: plan.poolName,
          probability: plan.probability || plan.predictedProbability,
          status: status,
          timestamp: targetTime,
          isCurrent: status === 'current'
        };
      });

      // 找到当前节点
      const currentIndex = nodes.findIndex(n => n.status === 'current');

      this.setData({
        nodes,
        currentIndex: currentIndex === -1 ? nodes.length : currentIndex
      });

      // 设置初始滚动位置
      this.setInitialScrollPosition();
    },

    /**
     * 获取节点状态
     * @param {number} timestamp 目标时间
     * @param {number} now 当前时间
     * @returns {string} 状态：past/current/future
     */
    getNodeStatus(timestamp, now) {
      const dayDiff = (timestamp - now) / (24 * 60 * 60 * 1000);

      if (dayDiff < -1) {
        return 'past';
      }

      if (dayDiff <= 1) {
        return 'current';
      }

      return 'future';
    },

    /**
     * 格式化节点日期显示
     * @param {number} timestamp 时间戳
     * @returns {string} 格式化日期
     */
    formatNodeDate(timestamp) {
      const date = new Date(timestamp);
      const month = (date.getMonth() + 1).toString();
      const day = date.getDate().toString();

      return `${month}/${day}`;
    },

    /**
     * 更新当前节点状态
     */
    updateCurrentNode() {
      const now = Date.now();
      const nodes = this.data.nodes.map(node => {
        node.status = this.getNodeStatus(node.timestamp, now);
        node.isCurrent = node.status === 'current';
        return node;
      });

      const currentIndex = nodes.findIndex(n => n.status === 'current');

      this.setData({
        nodes,
        currentIndex: currentIndex === -1 ? nodes.length : currentIndex
      });
    },

    /**
     * 设置初始滚动位置
     */
    setInitialScrollPosition() {
      // 如果有当前节点，滚动到当前节点位置
      if (this.data.currentIndex >= 0 && this.data.currentIndex < this.data.nodes.length) {
        // 每个节点大约宽度为100px + 20px间距
        const nodeWidth = 120;
        const scrollLeft = this.data.currentIndex * nodeWidth - 50; // 居中显示

        this.setData({ scrollLeft: Math.max(0, scrollLeft) });
      }
    },

    /**
     * 点击节点
     * @param {Event} e 事件对象
     */
    onNodeTap(e) {
      const { node } = e.currentTarget.dataset;

      // 触发节点点击事件
      this.triggerEvent('nodetap', {
        node,
        planId: node.planId
      });
    }
  }
});