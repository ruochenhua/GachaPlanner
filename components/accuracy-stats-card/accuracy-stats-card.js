/**
 * 准确度统计卡片组件
 * 展示规划准确度统计信息
 */

const historyService = require('../../services/history-service');

const RATING_CLASS_MAP = {
  excellent: 'rating-excellent',
  good: 'rating-good',
  average: 'rating-average',
  poor: 'rating-poor'
};



Component({
  properties: {
    // 游戏ID筛选（可选）
    gameId: {
      type: String,
      value: ''
    },
    // 是否显示趋势
    showTrend: {
      type: Boolean,
      value: true
    }
  },

  data: {
    // 命中率
    hitRate: 0,
    // 成功次数
    successes: 0,
    // 失败次数
    failures: 0,
    // 总记录数
    total: 0,
    // 评级
    rating: {
      level: 'average',
      label: '一般'
    },
    ratingClass: 'rating-average',
    // 趋势
    trend: {
      direction: 'stable',
      change: 0
    },
    // 是否正在加载
    loading: true,
    // 是否有数据
    hasData: false
  },

  lifetimes: {
    attached() {
      this.loadStats();
    }
  },

  observers: {
    'gameId': function() {
      this.loadStats();
    }
  },

  methods: {
    /**
     * 加载统计数据
     */
    loadStats() {
      this.setData({ loading: true });

      const result = historyService.getAccuracy(this.data.gameId || undefined);

      if (result.success) {
        const { hitRate, successes, failures, total, rating, trend } = result.data;

        this.setData({
          hitRate,
          successes,
          failures,
          total,
          rating,
          ratingClass: RATING_CLASS_MAP[rating.level] || 'rating-average',
          trend,
          hasData: total > 0,
          loading: false
        });
      } else {
        this.setData({
          loading: false,
          hasData: false
        });
      }
    },

    /**
     * 刷新数据
     */
    refresh() {
      this.loadStats();
    }
  }
});
