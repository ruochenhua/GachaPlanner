// components/probability-interval/probability-interval.js
// 概率区间展示组件

const probabilityInterval = require('../../core/calculator/probability-interval');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 概率值（0-100）
    probability: {
      type: Number,
      value: 0,
      observer: 'onDataChange'
    },
    // 概率分布数组（来自计算引擎）
    distribution: {
      type: Array,
      value: [],
      observer: 'onDataChange'
    },
    // 置信水平（默认95%）
    confidenceLevel: {
      type: Number,
      value: 95
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 区间下限
    lowerBound: 0,
    // 区间上限
    upperBound: 100,
    // 不确定性程度（0-1）
    uncertainty: 0,
    // 区间宽度百分比
    intervalWidth: 100,
    // 当前概率位置百分比
    positionPercent: 50,
    // 颜色编码
    colorClass: 'yellow',
    // 是否显示不确定性警告
    showWarning: false,
    // 可访问性描述
    ariaLabel: '',
    // 空数据状态
    isEmpty: true
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.calculateAndDisplay();
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 数据变化监听器
     */
    onDataChange() {
      this.calculateAndDisplay();
    },

    /**
     * 计算并显示区间
     */
    calculateAndDisplay() {
      const { probability, distribution, confidenceLevel } = this.properties;

      // 检查空数据
      if (!distribution || distribution.length === 0) {
        this.setData({
          isEmpty: true,
          lowerBound: 0,
          upperBound: 100,
          uncertainty: 1,
          intervalWidth: 100,
          positionPercent: 50,
          colorClass: 'yellow',
          showWarning: false,
          ariaLabel: '暂无概率数据'
        });
        return;
      }

      // 计算置信区间
      const interval = probabilityInterval.calculateInterval(distribution, confidenceLevel);

      // 计算当前概率在区间内的相对位置
      const positionPercent = probabilityInterval.calculatePosition(
        probability,
        interval.lower,
        interval.upper
      );

      // 计算区间宽度
      const intervalWidth = interval.upper - interval.lower;

      // 获取颜色类别
      const colorClass = probabilityInterval.getColorClass(probability);

      // 判断是否显示警告
      const showWarning = probabilityInterval.shouldShowUncertaintyWarning(interval.uncertainty);

      // 生成可访问性描述
      const ariaLabel = probabilityInterval.generateDescription(
        interval.lower,
        interval.upper,
        probability,
        confidenceLevel
      );

      this.setData({
        isEmpty: false,
        lowerBound: interval.lower,
        upperBound: interval.upper,
        uncertainty: interval.uncertainty,
        intervalWidth: intervalWidth,
        positionPercent: positionPercent,
        colorClass: colorClass,
        showWarning: showWarning,
        ariaLabel: ariaLabel
      });
    },

    /**
     * 获取不确定性说明文本
     */
    getUncertaintyHint(uncertainty) {
      if (uncertainty > 0.5) {
        return '不确定性很高，建议谨慎参考';
      } else if (uncertainty > 0.3) {
        return '不确定性较高，建议参考更多信息';
      }
      return '';
    }
  }
});