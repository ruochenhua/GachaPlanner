/**
 * 概率置信区间计算模块
 * 用于计算概率分布的置信区间和不确定性程度
 */

/**
 * Z分数映射表（不同置信水平）
 */
const Z_SCORES = {
  90: 1.645,
  95: 1.96,
  99: 2.576
};

/**
 * 计算概率置信区间
 * @param {Array} distribution 概率分布数组（0-100的概率值）
 * @param {Number} confidenceLevel 置信水平（如95）
 * @returns {Object} { lower, upper, uncertainty, mean, stdDev }
 */
function calculateInterval(distribution, confidenceLevel = 95) {
  // 空数据处理
  if (!distribution || distribution.length === 0) {
    return {
      lower: 0,
      upper: 100,
      uncertainty: 1,
      mean: 50,
      stdDev: 50
    };
  }

  // 单点数据处理
  if (distribution.length === 1) {
    const value = distribution[0];
    return {
      lower: Math.max(0, value - 10),
      upper: Math.min(100, value + 10),
      uncertainty: 0.2,
      mean: value,
      stdDev: 10
    };
  }

  // 计算均值（期望概率）
  const mean = distribution.reduce((sum, p) => sum + p, 0) / distribution.length;

  // 计算标准差
  const variance = distribution.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / distribution.length;
  const stdDev = Math.sqrt(variance);

  // 获取Z分数
  const z = Z_SCORES[confidenceLevel] || 1.96;

  // 计算置信区间
  const margin = z * stdDev;
  const lower = Math.max(0, mean - margin);
  const upper = Math.min(100, mean + margin);

  // 不确定性程度（基于区间宽度）
  // 区间越宽，不确定性越高
  const intervalWidth = upper - lower;
  const uncertainty = Math.min(1, intervalWidth / 100);

  return {
    lower: Math.round(lower),
    upper: Math.round(upper),
    uncertainty: Math.round(uncertainty * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100
  };
}

/**
 * 计算概率在区间内的相对位置
 * @param {Number} probability 当前概率值
 * @param {Number} lower 区间下限
 * @param {Number} upper 区间上限
 * @returns {Number} 相对位置百分比（0-100）
 */
function calculatePosition(probability, lower, upper) {
  if (upper === lower) {
    return 50; // 区间宽度为0时，位置在中间
  }
  const position = (probability - lower) / (upper - lower) * 100;
  return Math.max(0, Math.min(100, Math.round(position)));
}

/**
 * 根据概率值获取颜色类别
 * @param {Number} probability 概率值（0-100）
 * @returns {String} 颜色类别（green/yellow/red）
 */
function getColorClass(probability) {
  if (probability >= 80) {
    return 'green';
  } else if (probability >= 50) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * 判断是否需要显示不确定性警告
 * @param {Number} uncertainty 不确定性程度（0-1）
 * @param {Number} threshold 阈值（默认0.3）
 * @returns {Boolean} 是否需要显示警告
 */
function shouldShowUncertaintyWarning(uncertainty, threshold = 0.3) {
  return uncertainty > threshold;
}

/**
 * 生成区间描述文本（可访问性）
 * @param {Number} lower 区间下限
 * @param {Number} upper 区间上限
 * @param {Number} probability 当前概率
 * @param {Number} confidenceLevel 置信水平
 * @returns {String} 描述文本
 */
function generateDescription(lower, upper, probability, confidenceLevel = 95) {
  return `达成概率的${confidenceLevel}%置信区间为${lower}%到${upper}%，当前预测概率${probability}%`;
}

module.exports = {
  calculateInterval,
  calculatePosition,
  getColorClass,
  shouldShowUncertaintyWarning,
  generateDescription,
  Z_SCORES
};