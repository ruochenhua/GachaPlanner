// components/probability-display/probability-display.js
// 概率展示组件（带数字滚动动画）

const ANIMATION_DURATION = 300;
const { formatProbability } = require('../../utils/format-probability');

Component({
  properties: {
    probability: {
      type: Number,
      value: 0
    },
    animated: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    }
  },

  data: {
    displayProbability: '0%',
    displayValue: 0,
    riskLevel: 'low',
    riskClass: 'risk-low',
    riskText: '低概率',
    riskIcon: '⚠'
  },

  observers: {
    'probability': function(newVal, oldVal) {
      if (newVal === undefined && oldVal === undefined) return;
      this.handleProbabilityChange(newVal);
    }
  },

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
      if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
      }
    }
  },

  methods: {
    normalizeProbability(probability) {
      if (probability === null || probability === undefined) return 0;
      const n = Number(probability);
      if (Number.isNaN(n)) return 0;
      return Math.min(1, Math.max(0, n));
    },

    handleProbabilityChange(newVal) {
      const oldVal = this._lastProbability || 0;
      const oldNormalized = this.normalizeProbability(oldVal);
      const newNormalized = this.normalizeProbability(newVal);
      this._lastProbability = newVal;
      this.updateDisplayImmediate(newNormalized);
    },

    updateDisplayImmediate(normalized) {
      const displayText = formatProbability(normalized);
      const percentage = normalized * 100;
      const riskInfo = this.getRiskLevel(normalized);

      this.setData({
        displayValue: percentage,
        displayProbability: displayText,
        riskLevel: riskInfo.level,
        riskClass: riskInfo.class,
        riskText: riskInfo.text,
        riskIcon: riskInfo.icon
      });
    },

    animateValueChange(oldValue, newValue) {
      if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
      }

      const startTime = Date.now();
      const diff = newValue - oldValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
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
          const riskInfo = this.getRiskLevel(newValue / 100);
          this.setData({
            riskLevel: riskInfo.level,
            riskClass: riskInfo.class,
            riskText: riskInfo.text,
            riskIcon: riskInfo.icon
          });
        }
      };

      this._animationFrameId = requestAnimationFrame(animate);
    },

    getRiskLevel(probability) {
      const percentage = probability * 100;

      if (percentage >= 80) {
        return {
          level: 'high',
          class: 'risk-high',
          text: '高概率',
          icon: '⚡'
        };
      } else if (percentage >= 50) {
        return {
          level: 'medium',
          class: 'risk-medium',
          text: '中等概率',
          icon: '⚠️'
        };
      } else {
        return {
          level: 'low',
          class: 'risk-low',
          text: '低概率',
          icon: '⚠'
        };
      }
    }
  }
});
