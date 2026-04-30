// core/suggestion/risk-analyzer.js
// 风险分析器 - 分析概率风险、资源缺口、保底距离

/**
 * 风险分析器类
 * 负责分析抽卡风险等级、计算资源缺口和囤积需求
 */
class RiskAnalyzer {
  /**
   * 分析风险
   * @param {number} probability - 达成概率(0-1)
   * @param {Object} resources - 资源数据 {primogems, currentPity}
   * @param {Object} target - 目标数据 {requiredPulls, hardPity, dailyIncome}
   * @returns {Object} 风险分析结果
   */
  analyzeRisk(probability, resources, target) {
    const resourceGap = this.calculateResourceGap(resources, target);
    const hoardingNeeded = resourceGap < 0;
    let hoardingDays = 0;
    if (hoardingNeeded) {
      const income = Number(target?.dailyIncome);
      if (Number.isFinite(income) && income > 0) {
        hoardingDays = this.calculateHoardingDays(resourceGap, income);
      } else {
        hoardingDays = null;
      }
    }

    return {
      probabilityTier: this.getProbabilityTier(probability),
      resourceGap,
      pityDistance: this.calculatePityDistance(resources, target),
      hoardingNeeded,
      hoardingDays
    };
  }

  /**
   * 按达成概率分段（high=高达成概率区间，非「风险高」）
   * @param {number} probability - 达成概率(0-1)
   * @returns {string} 'high'|'medium'|'low'
   */
  getProbabilityTier(probability) {
    const percentage = probability * 100;
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  }

  /**
   * 计算资源缺口
   * @param {Object} resources - 资源数据 {primogems, currentPity}
   * @param {Object} target - 目标数据 {requiredPulls, hardPity}
   * @returns {number} 资源缺口(正数表示盈余,负数表示不足)
   */
  calculateResourceGap(resources, target) {
    const gems = resources?.primogems;
    if (typeof gems !== 'number' || !Number.isFinite(gems)) {
      return NaN;
    }
    return gems / 160 - target.requiredPulls;
  }

  /**
   * 计算保底距离
   * @param {Object} resources - 资源数据 {currentPity}
   * @param {Object} target - 目标数据 {hardPity}
   * @returns {number} 保底距离(剩余抽数)
   */
  calculatePityDistance(resources, target) {
    return target.hardPity - (resources.currentPity || 0);
  }

  /**
   * 计算囤积天数
   * @param {number} resourceGap - 资源缺口
   * @param {number} dailyIncome - 每日原石收入
   * @returns {number} 需要囤积的天数
   */
  calculateHoardingDays(resourceGap, dailyIncome) {
    if (resourceGap >= 0) return 0;
    const income = Number(dailyIncome);
    if (!Number.isFinite(income) || income <= 0) {
      return null;
    }
    const neededResources = Math.abs(resourceGap) * 160;
    return Math.ceil(neededResources / income);
  }
}

module.exports = RiskAnalyzer;