// core/calculator/calculator-factory.js
// 计算器工厂

const BaseCalculator = require('./base-calculator');
const HardPityCalculator = require('./hard-pity');
const SoftPityCalculator = require('./soft-pity');
const NoPityCalculator = require('./no-pity');
const GuaranteeCalculator = require('./guarantee-calculator');
const LuckValueCalculator = require('./luck-value-calculator');
const MultiPoolCalculator = require('./multi-pool-calculator');

/**
 * 计算器工厂类
 * 根据游戏配置创建对应的计算器
 */
class CalculatorFactory {
  // 计算器类型映射
  static calculators = {
    'hard': HardPityCalculator,
    'soft': SoftPityCalculator,
    'none': NoPityCalculator,
    'no': NoPityCalculator,
    'base': BaseCalculator,
    'guarantee': GuaranteeCalculator,  // 大小保底计算器
    'luck': LuckValueCalculator,        // 幸运值计算器 (王者荣耀)
    'multi-pool': MultiPoolCalculator   // 多池联动计算器 (阴阳师)
  };

  /**
   * 创建计算器
   * @param {Object} config - 游戏配置
   * @returns {Object} 计算器实例
   */
  static createCalculator(config) {
    const { pityType, guaranteeRate, multiPool } = config;

    // 如果配置了大小保底机制（guaranteeRate），自动使用 GuaranteeCalculator
    let effectivePityType = pityType;
    if (guaranteeRate !== undefined && guaranteeRate < 1.0 && pityType !== 'guarantee') {
      effectivePityType = 'guarantee';
      console.log('检测到大小保底机制，使用 GuaranteeCalculator');
    }

    const CalculatorClass = this.calculators[effectivePityType] || BaseCalculator;

    console.log('创建计算器:', {
      pityType: effectivePityType,
      calculatorType: CalculatorClass.name,
      guaranteeRate: config.guaranteeRate
    });

    // 如果是多池计算器，需要传入配置对象
    if (effectivePityType === 'multi-pool' && multiPool && multiPool.enabled) {
      const sharedPityCount = config.sharedPityCount || 0;
      const pools = multiPool.pools || [];
      return new CalculatorClass({ pools, sharedPityCount, gameConfig: config });
    }

    return new CalculatorClass();
  }

  /**
   * 注册新的计算器类型
   * @param {string} pityType - 保底类型
   * @param {Class} CalculatorClass - 计算器类
   */
  static registerCalculator(pityType, CalculatorClass) {
    this.calculators[pityType] = CalculatorClass;

    console.log('注册计算器:', {
      pityType,
      calculatorType: CalculatorClass.name
    });
  }

  /**
   * 获取支持的保底类型列表
   * @returns {Array} 保底类型列表
   */
  static getSupportedTypes() {
    return Object.keys(this.calculators);
  }
}

module.exports = CalculatorFactory;