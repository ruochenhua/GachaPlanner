/**
 * 格式化概率值为百分比字符串
 * 统一规则：保留1位小数，特殊值处理
 * @param {Number} probability - 0-1 区间的概率值
 * @returns {String} 如 "75.0%", "100%", "<0.1%"
 */
function formatProbability(probability) {
  if (probability === undefined || probability === null || isNaN(probability)) {
    return '?%';
  }
  const n = Number(probability);
  const pct = n * 100;
  if (pct >= 99.95) {
    return '100%';
  }
  if (pct < 0.1) {
    return pct.toFixed(2) + '%';
  }
  return pct.toFixed(1) + '%';
}

module.exports = { formatProbability };
