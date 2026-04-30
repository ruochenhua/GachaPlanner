// components/game-card/game-card.js
// 游戏卡片组件

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
      console.log('游戏卡片点击:', this.data.gameId);

      // 防止重复点击
      if (this.data.clicking) {
        console.log('防止重复点击，忽略');
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
      if (prob >= 80) return 'success';
      if (prob >= 50) return 'warning';
      return 'error';
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'probability': function(prob) {
      const colorClass = this.getProbabilityColorClass(prob);
      this.setData({
        probabilityColor: colorClass
      });
    }
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      console.log('游戏卡片组件attached:', this.data.gameName);
    }
  }
});