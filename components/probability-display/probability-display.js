// components/probability-display/probability-display.js
// 概率展示组件（带数字滚动动画）

const ANIMATION_DURATION = 300; // 动画持续时间（ms）
const { formatProbability } = require('../../utils/format-probability');

Component({
  /**
   * 组件属性
   */
  properties: {
    // 概率值（0-1的小数，如0.65表示65%）
    probability: {
      type: Number,
      value: 0
    },
    // 是否启用动画
    animated: {
      type: Boolean,
      value: true
    },
    // 加载状态
    loading: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    displayProbability: '0%',      // 显示的概率文本
    displayValue: 0,               // 当前显示的数值（用于动画）
    riskLevel: 'low',              // 风险等级：high/medium/low
    riskColor: '#C47070',          // 风险颜色
    riskText: '低概率',            // 风险文字说明
    riskIcon: '⚠'                 // 风险图标
  },

  /**
   * 数据监听器 - 使用 observers 监听属性变化
   */
  observers: {
    'probability': function(newVal, oldVal) {
      // 跳过初始值为undefined的情况
      if (newVal === undefined && oldVal === undefined) return;

      this.handleProbabilityChange(newVal);
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      const initVal = this.properties.probability || 0;
      this.handleProbabilityChange(initVal);
    },
    ready() {
      const readyVal = this.properties.probability || 0;
      if (Math.abs(this.data.displayValue - readyVal * 100) > 0.1) {
        this.handleProbabilityChange(readyVal);
      }
    },
    detached() {
      // 清理动画帧
      if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 将输入规范为 [0,1] 内有效数字，非法则视为 0
     */
    normalizeProbability(probability) {
      if (probability === null || probability === undefined) return 0;
      const n = Number(probability);
      if (Number.isNaN(n)) return 0;
      return Math.min(1, Math.max(0, n));
    },

    /**
     * 处理概率变化
     * @param {Number} newVal - 新的概率值
     */
    handleProbabilityChange(newVal) {
      const oldVal = this._lastProbability || 0;
      const oldNormalized = this.normalizeProbability(oldVal);
      const newNormalized = this.normalizeProbability(newVal);

      // 保存当前值
      this._lastProbability = newVal;

      // 直接更新显示（不使用动画，确保立即更新）
      this.updateDisplayImmediate(newNormalized);
    },

    /**
     * 立即更新显示（不带动画）
     * @param {Number} normalized - 已规范化的概率值
     */
    updateDisplayImmediate(normalized) {
      const displayText = formatProbability(normalized);
      const percentage = normalized * 100;
      const riskInfo = this.getRiskLevel(normalized);

      this.setData({
        displayValue: percentage,
        displayProbability: displayText,
        riskLevel: riskInfo.level,
        riskColor: riskInfo.color,
        riskText: riskInfo.text,
        riskIcon: riskInfo.icon
      });
    },

    /**
     * 数值变化动画
     * @param {Number} oldValue - 旧值（0-100）
     * @param {Number} newValue - 新值（0-100）
     */
    animateValueChange(oldValue, newValue) {
      // 取消之前的动画
      if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
      }

      const startTime = Date.now();
      const diff = newValue - oldValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        // 使用easeOutQuad缓动函数
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = oldValue + diff * easedProgress;

        this.setData({
          displayValue: currentValue,
          displayProbability: formatProbability(currentValue / 100)
        });

        if (progress < 1) {
          this._animationFrameId = requestAnimationFrame(animate);
        } else {
          this._animationFrameId = null;
          // 动画完成，更新风险等级
          const riskInfo = this.getRiskLevel(newValue / 100);
          this.setData({
            riskLevel: riskInfo.level,
            riskColor: riskInfo.color,
            riskText: riskInfo.text,
            riskIcon: riskInfo.icon
          });
        }
      };

      this._animationFrameId = requestAnimationFrame(animate);
    },

    /**
     * 获取风险等级信息
     * @param {Number} probability - 已规范化的概率值
     * @returns {Object} 风险等级信息
     */
    getRiskLevel(probability) {
      const percentage = probability * 100;

      if (percentage >= 80) {
        return {
          level: 'high',
          color: '#7FB069',         // Success Green
          text: '高概率',
          icon: '⚡'
        };
      } else if (percentage >= 50) {
        return {
          level: 'medium',
          color: '#E4C786',         // Warning Yellow
          text: '中等概率',
          icon: '⚠️'
        };
      } else {
        return {
          level: 'low',
          color: '#C47070',         // Error Red
          text: '低概率',
          icon: '⚠'
        };
      }
    }
  }
});