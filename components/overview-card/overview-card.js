// components/overview-card/overview-card.js
// 总览卡片组件

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    totalResources: {
      type: Number,
      value: 0
    },
    monthlyPlans: {
      type: Number,
      value: 0
    },
    resourceDistribution: {
      type: Array,
      value: []
    },
    averageProbability: {
      type: Number,
      value: 0
    },
    combinedProbability: {
      type: Number,
      value: 0
    },
    optimalGameName: {
      type: String,
      value: ''
    },
    strategyAdvice: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pieChart: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 绘制饼图
     */
    drawPieChart() {
      // TODO: 后续集成wx-charts绘制饼图
      // 当前使用简化版本展示资源分配
      console.log('绘制饼图 - 资源分配:', this.data.resourceDistribution);
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toLocaleString('zh-CN');
    }
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      console.log('总览卡片组件attached');
      this.drawPieChart();
    },

    ready() {
      console.log('总览卡片组件ready');
    }
  }
});