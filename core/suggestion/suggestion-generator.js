// core/suggestion/suggestion-generator.js
// 建议生成器 - 将概率计算结果转化为用户可执行的智能建议

const { success, error } = require('../../utils/result');
const RiskAnalyzer = require('./risk-analyzer');
const StrategyOptimizer = require('./strategy-optimizer');
const { SuggestionType, SuggestionLevel, SuggestionIcon } = require('./constants');

/**
 * 建议生成器类
 * 核心功能：将概率计算结果转化为具体可执行的建议
 */
class SuggestionGenerator {
  constructor() {
    this.riskAnalyzer = new RiskAnalyzer();
    this.strategyOptimizer = new StrategyOptimizer();
  }

  /**
   * 生成建议
   * @param {Object} calcResult - 概率计算结果 {probability, pityType}
   * @param {Object} resources - 资源数据 {primogems, currentPity}
   * @param {Object} target - 目标数据 {requiredPulls, hardPity, dailyIncome}
   * @returns {Object} Result包装的建议结果
   */
  generate(calcResult, resources, target) {
    try {
      if (!calcResult || typeof calcResult.probability !== 'number' || !Number.isFinite(calcResult.probability)) {
        return error('建议生成失败：无效的概率计算结果');
      }
      if (!resources || typeof resources.primogems !== 'number' || !Number.isFinite(resources.primogems)) {
        return error('建议生成失败：原石数量无效或未提供');
      }

      const suggestions = [];
      const riskAnalysis = this.riskAnalyzer.analyzeRisk(
        calcResult.probability, resources, target
      );

      // 生成风险建议
      suggestions.push(this.generateRiskSuggestion(riskAnalysis));

      // 生成囤积建议（如需）
      if (riskAnalysis.hoardingNeeded && riskAnalysis.hoardingDays != null) {
        suggestions.push(this.generateHoardingSuggestion(riskAnalysis));
      }

      // 生成保底建议（如需）
      const pitySuggestion = this.generatePitySuggestion(riskAnalysis);
      if (pitySuggestion) suggestions.push(pitySuggestion);

      // 排序并返回
      suggestions.sort((a, b) => a.priority - b.priority);

      return success({
        suggestions,
        primary: suggestions[0],
        confidence: this.calculateConfidence(calcResult, resources)
      });
    } catch (err) {
      return error('建议生成失败：' + err.message);
    }
  }

  /**
   * 生成风险建议
   * @param {Object} riskAnalysis - 风险分析结果 {probabilityTier}
   * @returns {Object} 风险建议对象
   */
  generateRiskSuggestion(riskAnalysis) {
    const tier = riskAnalysis.probabilityTier;

    if (tier === 'high') {
      return {
        type: SuggestionType.PRIORITY,
        level: SuggestionLevel.INFO,
        content: '建议抽取，达成概率高',
        priority: 1,
        confidence: 0.9,
        icon: SuggestionIcon.SUCCESS,
        data: {}
      };
    } else if (tier === 'medium') {
      return {
        type: SuggestionType.RISK,
        level: SuggestionLevel.WARNING,
        content: '可考虑抽取，有一定风险',
        priority: 2,
        confidence: 0.7,
        icon: SuggestionIcon.WARNING,
        data: {}
      };
    } else {
      return {
        type: SuggestionType.RISK,
        level: SuggestionLevel.DANGER,
        content: '不建议抽取，风险较高',
        priority: 1,
        confidence: 0.8,
        icon: SuggestionIcon.DANGER,
        data: {}
      };
    }
  }

  /**
   * 生成囤积建议
   * @param {Object} riskAnalysis - 风险分析结果 {hoardingDays, resourceGap}
   * @returns {Object} 囤积建议对象
   */
  generateHoardingSuggestion(riskAnalysis) {
    return {
      type: SuggestionType.STRATEGY,
      level: SuggestionLevel.WARNING,
      content: `建议囤积${riskAnalysis.hoardingDays}天后再抽`,
      priority: 2,
      confidence: 0.75,
      icon: SuggestionIcon.IDEA,
      data: {
        days: riskAnalysis.hoardingDays,
        resources: Math.abs(riskAnalysis.resourceGap)
      }
    };
  }

  /**
   * 生成保底建议
   * @param {Object} riskAnalysis - 风险分析结果 {pityDistance}
   * @returns {Object|null} 保底建议对象或null
   */
  generatePitySuggestion(riskAnalysis) {
    const d = riskAnalysis.pityDistance;
    if (d > 10 || d <= 0 || !Number.isFinite(d)) return null;

    return {
      type: SuggestionType.PRIORITY,
      level: SuggestionLevel.INFO,
      content: `距离保底${d}抽，保底概率高`,
      priority: 3,
      confidence: 0.95,
      icon: SuggestionIcon.TARGET,
      data: { resources: d }
    };
  }

  /**
   * 生成多卡池建议
   * @param {Array} pools - 卡池数组 [{id, probability, resourceNeeded, startDate}]
   * @param {number} totalResources - 总资源数量
   * @returns {Object} 多卡池建议结果
   */
  generateMultiPoolSuggestions(pools, totalResources) {
    try {
      const strategyResult = this.strategyOptimizer.optimizeStrategy(pools, totalResources);
      const suggestions = [];

      // 生成优先级排序建议
      if (strategyResult.priorityOrder.length > 1) {
        const topPool = strategyResult.priorityOrder[0];
        const pool = pools.find(p => p.id === topPool.poolId);

        suggestions.push({
          type: SuggestionType.PRIORITY,
          level: SuggestionLevel.INFO,
          content: `建议优先抽${pool.name || '卡池'}（达成概率${Math.round(topPool.probability * 100)}%）`,
          priority: 1,
          confidence: 0.85,
          icon: SuggestionIcon.TARGET,
          data: {
            poolId: topPool.poolId,
            probability: topPool.probability
          }
        });
      }

      // 生成资源冲突建议
      if (strategyResult.conflicts) {
        suggestions.push({
          type: SuggestionType.STRATEGY,
          level: SuggestionLevel.WARNING,
          content: '多卡池资源不足，建议优先抽取高概率卡池',
          priority: 2,
          confidence: 0.75,
          icon: SuggestionIcon.WARNING,
          data: {
            conflicts: true
          }
        });
      }

      return success({
        suggestions,
        strategyAnalysis: strategyResult
      });
    } catch (err) {
      return error('多卡池建议生成失败：' + err.message);
    }
  }

  /**
   * 计算置信度
   * @param {Object} calcResult - 概率计算结果 {pityType}
   * @param {Object} resources - 资源数据 {primogems, currentPity}
   * @returns {number} 置信度(0-1)
   */
  calculateConfidence(calcResult, resources) {
    let confidence = 0.85;
    const p = calcResult.probability;
    if (typeof p === 'number' && p < 0.5) confidence -= 0.12;
    if (typeof p === 'number' && p < 0.2) confidence -= 0.08;
    if (!resources || typeof resources.primogems !== 'number' || !Number.isFinite(resources.primogems)) {
      confidence -= 0.12;
    }
    if (!resources || resources.currentPity === undefined) confidence -= 0.05;
    if (calcResult.pityType === 'hard') confidence += 0.05;
    return Math.min(Math.max(confidence, 0.35), 1.0);
  }
}

module.exports = SuggestionGenerator;