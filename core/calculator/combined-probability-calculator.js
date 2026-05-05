/**
 * 综合概率计算器
 * 计算多游戏场景下的综合达成概率和最优策略
 */

const CalculatorFactory = require('./calculator-factory');

/**
 * 计算综合概率
 * @param {Array} gamesData - 各游戏数据 [{gameId, name, resources, config, probability}]
 * @returns {Object} {combinedProbability, optimalGameId, optimalGameName, strategy, scenarios}
 */
function calculateCombinedProbability(gamesData) {
  // 验证输入
  if (!gamesData || !Array.isArray(gamesData) || gamesData.length === 0) {
    return {
      combinedProbability: 0,
      optimalGameId: null,
      optimalGameName: null,
      strategy: 'none'
    };
  }

  // 单游戏场景
  if (gamesData.length === 1) {
    return {
      combinedProbability: gamesData[0].probability,
      optimalGameId: gamesData[0].gameId,
      optimalGameName: gamesData[0].name,
      strategy: 'single'
    };
  }

  // 计算总资源（统一转换为抽数）
  const totalPulls = calculateTotalPulls(gamesData);

  if (totalPulls === 0) {
    return {
      combinedProbability: 0,
      optimalGameId: null,
      optimalGameName: null,
      strategy: 'none'
    };
  }

  // 计算每个游戏在获得所有资源时的假设概率
  const scenarios = gamesData.map(game => {
    const hypotheticalProbability = calculateHypotheticalProbability(
      game.config,
      totalPulls
    );
    return {
      gameId: game.gameId,
      gameName: game.name,
      currentProbability: game.probability,
      hypotheticalProbability
    };
  });

  // 找出最优策略（假设概率最高的游戏）
  const optimal = scenarios.reduce((best, current) =>
    current.hypotheticalProbability > best.hypotheticalProbability ? current : best
  );

  return {
    combinedProbability: optimal.hypotheticalProbability,
    optimalGameId: optimal.gameId,
    optimalGameName: optimal.gameName,
    strategy: 'concentrate',
    scenarios
  };
}

/**
 * 计算总抽数（统一转换）
 * @param {Array} gamesData - 各游戏数据
 * @returns {number} 总抽数
 */
function calculateTotalPulls(gamesData) {
  let totalPulls = 0;

  gamesData.forEach(game => {
    if (!game.resources || !game.config) return;

    const conversionRate = game.config.conversionRate?.primaryToPull || 160;
    const resourceKeys = Object.keys(game.config.resources || {});

    if (resourceKeys.length === 0) return;

    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;

    const primaryValue = Number(game.resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(game.resources[secondaryResourceKey]) || 0) : 0;

    totalPulls += Math.floor(primaryValue / conversionRate) + secondaryValue;
  });

  return totalPulls;
}

/**
 * 计算假设概率（假设所有资源都投入该游戏）
 * @param {Object} config - 游戏配置
 * @param {number} totalPulls - 总抽数
 * @returns {number} 假设概率 (0-1)
 */
function calculateHypotheticalProbability(config, totalPulls) {
  if (!config || totalPulls === 0) {
    return 0;
  }

  try {
    // 构建假设资源
    const hypotheticalResources = {};
    const resourceKeys = Object.keys(config.resources || {});
    if (resourceKeys.length > 0) {
      // 假设所有抽数都是纠缠之缘（次要资源）
      hypotheticalResources[resourceKeys[0]] = 0;
      if (resourceKeys[1]) {
        hypotheticalResources[resourceKeys[1]] = totalPulls;
      } else {
        // 如果没有次要资源，将抽数转换为主要资源
        const conversionRate = config.conversionRate?.primaryToPull || 160;
        hypotheticalResources[resourceKeys[0]] = totalPulls * conversionRate;
      }
    }

    // 构建计算参数
    const target = {
      pulls: Math.min(totalPulls, config.hardPity?.count || 90),
      currentPity: 0
    };

    // 创建计算器并计算
    const calculator = CalculatorFactory.createCalculator(config);
    const result = calculator.calculate({
      resources: hypotheticalResources,
      target,
      config
    });

    if (result.success && result.data && result.data.length > 0) {
      return result.data[result.data.length - 1].cumulativeProbability;
    }

    return 0;
  } catch (err) {
    console.error('假设概率计算异常:', err);
    return 0;
  }
}

/**
 * 生成策略建议文字
 * @param {Object} combinedResult - 综合概率计算结果
 * @returns {string} 策略建议
 */
function generateStrategyAdvice(combinedResult) {
  if (!combinedResult || combinedResult.strategy === 'none') {
    return '暂无数据';
  }

  if (combinedResult.strategy === 'single') {
    return '当前只有一个游戏';
  }

  if (combinedResult.strategy === 'concentrate') {
    const probability = Math.round(combinedResult.combinedProbability * 100);
    return `集中${combinedResult.optimalGameName}资源，达成概率可达${probability}%`;
  }

  return '';
}

module.exports = {
  calculateCombinedProbability,
  generateStrategyAdvice
};