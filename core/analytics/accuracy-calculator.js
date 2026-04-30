/**
 * 准确度计算模块
 * 用于统计和评估规划预测的准确性
 */

/**
 * 计算命中率
 * @param {Array} records 历史记录列表
 * @returns {Object} 命中率结果 {hitRate, successes, failures, total}
 */
function calculateHitRate(records) {
  if (!records || records.length === 0) {
    return {
      hitRate: 0,
      successes: 0,
      failures: 0,
      total: 0
    };
  }

  const successes = records.filter(r => r.actualResult === 'success').length;
  const failures = records.filter(r => r.actualResult === 'failure').length;
  const total = records.filter(r => r.actualResult !== 'pending').length;

  const hitRate = total > 0 ? Math.round((successes / total) * 100) : 0;

  return {
    hitRate,
    successes,
    failures,
    total
  };
}

/**
 * 计算概率偏差
 * @param {Array} records 历史记录列表
 * @returns {Object} 偏差统计 {meanDeviation, stdDev, deviations}
 */
function calculateDeviation(records) {
  if (!records || records.length === 0) {
    return {
      meanDeviation: 0,
      stdDev: 0,
      deviations: []
    };
  }

  // 过滤有预测概率和实际结果的记录
  const validRecords = records.filter(r =>
    r.predictedProbability !== undefined &&
    r.actualResult !== 'pending'
  );

  if (validRecords.length === 0) {
    return {
      meanDeviation: 0,
      stdDev: 0,
      deviations: []
    };
  }

  // 计算每条记录的偏差
  const deviations = validRecords.map(r => {
    // 实际成功率：成功为100%，失败为0%
    const actualRate = r.actualResult === 'success' ? 100 : 0;
    // 偏差 = |预测概率 - 实际成功率|
    return Math.abs(r.predictedProbability - actualRate);
  });

  // 计算平均偏差
  const sum = deviations.reduce((acc, d) => acc + d, 0);
  const meanDeviation = sum / deviations.length;

  // 计算标准差
  const squaredDiffs = deviations.map(d => Math.pow(d - meanDeviation, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, d) => acc + d, 0) / deviations.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    meanDeviation: Math.round(meanDeviation * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    deviations
  };
}

/**
 * 按游戏分类统计
 * @param {Array} records 历史记录列表
 * @returns {Object} 分组统计数据 {gameId: {hitRate, successes, failures, total, meanDeviation}}
 */
function calculateByGame(records) {
  if (!records || records.length === 0) {
    return {};
  }

  // 按游戏ID分组
  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.gameId]) {
      grouped[r.gameId] = {
        gameId: r.gameId,
        gameName: r.gameName,
        records: []
      };
    }
    grouped[r.gameId].records.push(r);
  });

  // 计算每个游戏的统计
  const result = {};
  Object.keys(grouped).forEach(gameId => {
    const gameRecords = grouped[gameId].records;
    const hitRateResult = calculateHitRate(gameRecords);
    const deviationResult = calculateDeviation(gameRecords);

    result[gameId] = {
      gameId,
      gameName: grouped[gameId].gameName,
      ...hitRateResult,
      meanDeviation: deviationResult.meanDeviation,
      stdDev: deviationResult.stdDev
    };
  });

  return result;
}

/**
 * 计算准确度评级
 * @param {number} hitRate 命中率
 * @returns {Object} 评级结果 {level, label, color}
 */
function calculateRating(hitRate) {
  if (hitRate >= 95) {
    return {
      level: 'excellent',
      label: '优秀',
      color: '#7FB069' // Success Green
    };
  }

  if (hitRate >= 80) {
    return {
      level: 'good',
      label: '良好',
      color: '#E4C786' // Warning Yellow
    };
  }

  if (hitRate >= 60) {
    return {
      level: 'average',
      label: '一般',
      color: '#C4A77D' // Primary
    };
  }

  return {
    level: 'poor',
    label: '较差',
    color: '#C47070' // Danger Red
  };
}

/**
 * 计算趋势
 * @param {Array} records 历史记录列表（按时间倒序）
 * @param {number} recentCount 近期记录数量（默认10）
 * @returns {Object} 趋势结果 {direction, change, recentRate, previousRate}
 */
function calculateTrend(records, recentCount = 10) {
  if (!records || records.length < recentCount) {
    return {
      direction: 'stable',
      change: 0,
      recentRate: 0,
      previousRate: 0
    };
  }

  // 近期记录
  const recentRecords = records.slice(0, recentCount);
  // 之前记录
  const previousRecords = records.slice(recentCount, recentCount * 2);

  if (previousRecords.length === 0) {
    return {
      direction: 'stable',
      change: 0,
      recentRate: calculateHitRate(recentRecords).hitRate,
      previousRate: 0
    };
  }

  const recentRate = calculateHitRate(recentRecords).hitRate;
  const previousRate = calculateHitRate(previousRecords).hitRate;
  const change = recentRate - previousRate;

  let direction = 'stable';
  if (change > 5) {
    direction = 'up';
  } else if (change < -5) {
    direction = 'down';
  }

  return {
    direction,
    change,
    recentRate,
    previousRate
  };
}

/**
 * 计算整体准确度
 * @param {Array} records 历史记录列表
 * @returns {Object} 完整统计数据
 */
function calculateOverallAccuracy(records) {
  const hitRateResult = calculateHitRate(records);
  const deviationResult = calculateDeviation(records);
  const byGameResult = calculateByGame(records);
  const ratingResult = calculateRating(hitRateResult.hitRate);
  const trendResult = calculateTrend(records);

  return {
    // 命中率统计
    ...hitRateResult,
    // 偏差统计
    meanDeviation: deviationResult.meanDeviation,
    stdDev: deviationResult.stdDev,
    // 评级
    rating: ratingResult,
    // 趋势
    trend: trendResult,
    // 按游戏分组
    byGame: byGameResult
  };
}

/**
 * 计算置信区间
 * @param {number} successes 成功次数
 * @param {number} total 总次数
 * @param {number} confidenceLevel 置信水平（90/95/99）
 * @returns {Object} 置信区间 {lower, upper}
 */
function calculateConfidenceInterval(successes, total, confidenceLevel = 95) {
  if (total === 0) {
    return { lower: 0, upper: 100 };
  }

  // Z分数
  const zScores = {
    90: 1.645,
    95: 1.96,
    99: 2.576
  };

  const z = zScores[confidenceLevel] || 1.96;

  // 样本比例
  const p = successes / total;

  // 标准误差
  const se = Math.sqrt((p * (1 - p)) / total);

  // 置信区间
  const lower = Math.max(0, p - z * se);
  const upper = Math.min(1, p + z * se);

  return {
    lower: Math.round(lower * 100),
    upper: Math.round(upper * 100)
  };
}

module.exports = {
  calculateHitRate,
  calculateDeviation,
  calculateByGame,
  calculateRating,
  calculateTrend,
  calculateOverallAccuracy,
  calculateConfidenceInterval
};