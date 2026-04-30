// core/suggestion/strategy-optimizer.js
// 策略优化器 - 优化多卡池资源分配和优先级排序

const { PriorityWeight } = require('./constants');

/**
 * 策略优化器类
 * 负责优化多卡池资源分配和优先级排序
 */
class StrategyOptimizer {
  /**
   * 优化策略
   * @param {Array} pools - 卡池数组 [{id, probability, resourceNeeded, startDate}]
   * @param {number} totalResources - 总资源数量
   * @returns {Object} 策略优化结果
   */
  optimizeStrategy(pools, totalResources) {
    const poolAnalysis = pools.map(pool => ({
      poolId: pool.id,
      probability: pool.probability,
      resourceNeeded: pool.resourceNeeded,
      priority: this.calculatePriority(pool)
    }));

    return {
      poolAnalysis,
      conflicts: this.identifyResourceConflicts(pools, totalResources),
      priorityOrder: poolAnalysis.sort((a, b) => b.priority - a.priority)
    };
  }

  /**
   * 计算优先级得分
   * @param {Object} pool - 卡池数据 {probability, startDate}
   * @returns {number} 优先级得分(0-100)
   */
  calculatePriority(pool) {
    // 优先级得分 = 概率得分 × 70% + 时间紧迫性 × 30%
    const probabilityScore = pool.probability * 100;
    const urgencyScore = this.getUrgencyScore(pool.startDate);
    return probabilityScore * PriorityWeight.PROBABILITY +
           urgencyScore * PriorityWeight.URGENCY;
  }

  /**
   * 识别资源冲突
   * @param {Array} pools - 卡池数组
   * @param {number} totalResources - 总资源数量
   * @returns {boolean} 是否存在资源冲突
   */
  identifyResourceConflicts(pools, totalResources) {
    const totalNeeded = pools.reduce((sum, pool) => sum + pool.resourceNeeded, 0);
    return totalNeeded > totalResources;
  }

  /**
   * 获取时间紧迫性得分
   * @param {Date} startDate - 卡池开启日期
   * @returns {number} 紧迫性得分(0-100)
   */
  getUrgencyScore(startDate) {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      return 50;
    }
    const daysUntilStart = Math.ceil((startDate.getTime() - Date.now()) / 86400000);
    return Math.max(0, 100 - daysUntilStart * 5);
  }
}

module.exports = StrategyOptimizer;