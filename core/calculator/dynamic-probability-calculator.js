/**
 * 动态概率计算器
 * 计算卡池期间概率随时间变化的预测
 */

const CalculatorFactory = require('./calculator-factory');

/**
 * 计算动态概率预测
 * @param {Object} resources - 当前资源
 * @param {Object} config - 游戏配置
 * @param {Object} timeRange - 时间范围 {poolStartDate, poolEndDate, dailyIncome, otherIncome}
 * @returns {Object} {timeline, optimalWaitDays, waitAdvice, poolDays, remainingDays}
 */
function calculateDynamicProbability(resources, config, timeRange) {
  // 验证输入
  if (!resources || !config || !timeRange) {
    return {
      timeline: [],
      optimalWaitDays: 0,
      waitAdvice: '请设置卡池时间',
      poolDays: 0,
      remainingDays: 0
    };
  }

  const { poolStartDate, poolEndDate, dailyIncome = 0, otherIncome = 0 } = timeRange;

  // 验证日期
  if (!poolStartDate || !poolEndDate) {
    return {
      timeline: [],
      optimalWaitDays: 0,
      waitAdvice: '请设置卡池开始和结束日期',
      poolDays: 0,
      remainingDays: 0
    };
  }

  // 计算卡池持续天数
  const poolDays = calculateDaysBetween(poolStartDate, poolEndDate);
  if (poolDays <= 0) {
    return {
      timeline: [],
      optimalWaitDays: 0,
      waitAdvice: '卡池已结束',
      poolDays: 0,
      remainingDays: 0
    };
  }

  // 计算剩余天数
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(poolEndDate);
  const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

  // 如果每日收入为0且其他收入为0，不需要动态计算
  if (dailyIncome <= 0 && otherIncome <= 0) {
    const currentProbability = calculateProbabilityWithResources(resources, config);
    return {
      timeline: [{
        day: 0,
        date: formatDate(poolStartDate),
        resources: resources,
        probability: currentProbability
      }],
      optimalWaitDays: 0,
      waitAdvice: '当前概率固定，建议设置每日收入以查看预测',
      poolDays,
      remainingDays
    };
  }

  // 计算概率时间线
  const timeline = [];
  const conversionRate = config.conversionRate?.primogemsToFate || 160;
  const resourceKeys = Object.keys(config.resources || {});
  const primaryResourceKey = resourceKeys[0];

  for (let day = 0; day <= poolDays; day++) {
    // 计算该天的额外资源（每日收入累积 + 其他一次性收入）
    const dailyResources = dailyIncome * day;
    const additionalResources = dailyResources + otherIncome;

    // 构建该天的资源对象
    const dayResources = { ...resources };
    if (primaryResourceKey) {
      dayResources[primaryResourceKey] = (resources[primaryResourceKey] || 0) + additionalResources;
    }

    // 计算该天的概率
    const probability = calculateProbabilityWithResources(dayResources, config);

    timeline.push({
      day,
      date: formatDate(addDays(poolStartDate, day)),
      additionalResources,
      totalResources: dayResources[primaryResourceKey] || 0,
      probability
    });
  }

  // 找出最优等待天数（概率达到80%或以上的最早天数）
  const targetProbability = 0.8;
  let optimalWaitDays = 0;
  let optimalProbability = timeline[0]?.probability || 0;

  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].probability >= targetProbability) {
      optimalWaitDays = timeline[i].day;
      optimalProbability = timeline[i].probability;
      break;
    }
    if (timeline[i].probability > optimalProbability) {
      optimalWaitDays = timeline[i].day;
      optimalProbability = timeline[i].probability;
    }
  }

  // 生成建议
  const waitAdvice = generateWaitAdvice(optimalWaitDays, optimalProbability, remainingDays, poolDays);

  return {
    timeline,
    optimalWaitDays,
    optimalProbability,
    waitAdvice,
    poolDays,
    remainingDays
  };
}

/**
 * 使用资源计算概率
 * @param {Object} resources - 资源
 * @param {Object} config - 配置
 * @returns {number} 概率 (0-1)
 */
function calculateProbabilityWithResources(resources, config) {
  try {
    if (!resources || !config) {
      return 0;
    }

    const conversionRate = config.conversionRate?.primogemsToFate || 160;
    const resourceKeys = Object.keys(config.resources || {});

    if (resourceKeys.length === 0) {
      return 0;
    }

    const primaryResourceKey = resourceKeys[0];
    const secondaryResourceKey = resourceKeys[1] || null;

    const primaryValue = Number(resources[primaryResourceKey]) || 0;
    const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;

    const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;

    if (totalPulls === 0) {
      return 0;
    }

    // 构建计算参数
    const target = {
      pulls: Math.min(totalPulls, config.hardPity || 90),
      currentPity: 0
    };

    // 创建计算器并计算
    const calculator = CalculatorFactory.createCalculator(config);
    const result = calculator.calculate({
      resources,
      target,
      config
    });

    if (result.success && result.data && result.data.length > 0) {
      return result.data[result.data.length - 1].cumulativeProbability;
    }

    return 0;
  } catch (err) {
    console.error('概率计算异常:', err);
    return 0;
  }
}

/**
 * 计算两个日期之间的天数
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {number} 天数
 */
function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * 日期加天数
 * @param {string} dateStr - 日期字符串
 * @param {number} days - 天数
 * @returns {Date} 新日期
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} 格式化日期 (MM-DD)
 */
function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * 生成等待建议
 * @param {number} optimalWaitDays - 最优等待天数
 * @param {number} optimalProbability - 最优概率
 * @param {number} remainingDays - 剩余天数
 * @param {number} poolDays - 总天数
 * @returns {string} 建议
 */
function generateWaitAdvice(optimalWaitDays, optimalProbability, remainingDays, poolDays) {
  const probabilityPercent = Math.round(optimalProbability * 100);

  if (optimalWaitDays === 0) {
    return '当前资源充足，可以立即抽取';
  }

  if (optimalWaitDays > remainingDays) {
    return `卡池剩余${remainingDays}天，可能无法达到最优概率`;
  }

  if (optimalProbability >= 0.8) {
    return `建议囤积${optimalWaitDays}天后抽取，概率可达${probabilityPercent}%`;
  }

  if (optimalProbability >= 0.5) {
    return `囤积${optimalWaitDays}天后概率为${probabilityPercent}%，建议谨慎决策`;
  }

  return `囤积${optimalWaitDays}天后概率仅${probabilityPercent}%，建议降低目标或增加资源`;
}

module.exports = {
  calculateDynamicProbability,
  calculateProbabilityWithResources
};