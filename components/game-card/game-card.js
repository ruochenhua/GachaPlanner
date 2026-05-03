// components/game-card/game-card.js
// 游戏卡片组件
const { formatProbability } = require('../../utils/format-probability');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    gameId: {
      type: String,
      value: ''
    },
    gameName: {
      type: String,
      value: ''
    },
    gameIcon: {
      type: String,
      value: ''
    },
    totalPulls: {
      type: Number,
      value: 0
    },
    probability: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    probabilityColor: '',
    probabilityText: '',
    clicking: false // 防止重复点击
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 卡片点击事件
     */
    onTap() {
      // 防止重复点击
      if (this.data.clicking) {
        return;
      }

      this.setData({ clicking: true });

      this.triggerEvent('tap', {
        gameId: this.data.gameId
      });

      // 300ms后重置点击状态
      setTimeout(() => {
        this.setData({ clicking: false });
      }, 300);
    },

    /**
     * 获取概率颜色类名
     */
    getProbabilityColorClass(prob) {
      // 兼容传入的是 0-1 小数或 0-100 整数
      const pct = prob >= 1 ? prob : prob * 100;
      if (pct >= 80) return 'success';
      if (pct >= 50) return 'warning';
      return 'error';
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'probability': function(prob) {
      const colorClass = this.getProbabilityColorClass(prob);
      // 兼容传入的是 0-1 小数或 0-100 整数
      const normalizedProb = prob >= 1 ? prob / 100 : prob;
      this.setData({
        probabilityColor: colorClass,
        probabilityText: formatProbability(normalizedProb)
      });
    }
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      // 组件已挂载
    }
  }
});