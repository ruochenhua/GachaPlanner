/**
 * 数据过期检测工具
 * 用于检测游戏配置数据是否过期
 */

/**
 * 过期阈值天数（默认30天）
 */
const DEFAULT_EXPIRY_THRESHOLD = 30;

/**
 * 检测数据过期状态
 * @param {string|number} updatedAt 更新日期（字符串或时间戳）
 * @param {number} thresholdDays 过期阈值天数（默认30）
 * @returns {Object} 检测结果
 */
function checkDataExpiry(updatedAt, thresholdDays = DEFAULT_EXPIRY_THRESHOLD) {
  // 解析更新日期
  let updateDate;
  if (typeof updatedAt === 'string') {
    updateDate = new Date(updatedAt);
  } else if (typeof updatedAt === 'number') {
    updateDate = new Date(updatedAt);
  } else {
    return {
      isExpired: false,
      daysSinceUpdate: 0,
      thresholdDays,
      isValidDate: false,
      message: '无法解析更新日期'
    };
  }

  // 验证日期有效性
  if (isNaN(updateDate.getTime())) {
    return {
      isExpired: false,
      daysSinceUpdate: 0,
      thresholdDays,
      isValidDate: false,
      message: '更新日期格式无效'
    };
  }

  const now = new Date();
  const daysSinceUpdate = Math.floor((now - updateDate) / (24 * 60 * 60 * 1000));

  const isExpired = daysSinceUpdate > thresholdDays;

  return {
    isExpired,
    daysSinceUpdate,
    thresholdDays,
    isValidDate: true,
    updateDate: updateDate.toISOString().split('T')[0],
    message: isExpired
      ? `数据已${daysSinceUpdate}天未更新（超过${thresholdDays}天），请核对官方公告`
      : `数据${daysSinceUpdate === 0 ? '今日' : `${daysSinceUpdate}天前`}更新，数据正常`
  };
}

/**
 * 获取过期警告级别
 * @param {Object} expiryResult 过期检测结果
 * @returns {Object} 警告级别信息
 */
function getExpiryWarningLevel(expiryResult) {
  if (!expiryResult.isValidDate) {
    return {
      level: 'error',
      color: '#C47070',
      icon: '❌',
      label: '数据异常'
    };
  }

  const { daysSinceUpdate, thresholdDays } = expiryResult;

  if (daysSinceUpdate > thresholdDays) {
    return {
      level: 'expired',
      color: '#E4C786',
      icon: '⚠️',
      label: '数据过期'
    };
  }

  if (daysSinceUpdate > thresholdDays * 0.7) {
    return {
      level: 'warning',
      color: '#E4C786',
      icon: '⏰',
      label: '即将过期'
    };
  }

  return {
    level: 'normal',
    color: '#7FB069',
    icon: '✓',
    label: '数据正常'
  };
}

/**
 * 批量检测多个游戏数据过期状态
 * @param {Array} gameConfigs 游戏配置列表
 * @param {number} thresholdDays 过期阈值天数
 * @returns {Object} 批量检测结果
 */
function checkMultipleGamesExpiry(gameConfigs, thresholdDays = DEFAULT_EXPIRY_THRESHOLD) {
  const results = {};
  let expiredCount = 0;
  let warningCount = 0;

  gameConfigs.forEach(config => {
    const expiryResult = checkDataExpiry(config.updatedAt, thresholdDays);
    const warningLevel = getExpiryWarningLevel(expiryResult);

    results[config.gameId] = {
      ...expiryResult,
      warningLevel,
      gameName: config.name
    };

    if (warningLevel.level === 'expired') {
      expiredCount++;
    } else if (warningLevel.level === 'warning') {
      warningCount++;
    }
  });

  return {
    results,
    summary: {
      total: gameConfigs.length,
      expired: expiredCount,
      warning: warningCount,
      normal: gameConfigs.length - expiredCount - warningCount
    }
  };
}

/**
 * 格式化过期提示信息
 * @param {Object} expiryResult 过期检测结果
 * @returns {string} 格式化后的提示信息
 */
function formatExpiryMessage(expiryResult) {
  if (!expiryResult.isValidDate) {
    return '数据日期异常，请检查配置';
  }

  if (expiryResult.isExpired) {
    return `数据可能过期（超过${expiryResult.thresholdDays}天），请核对官方公告`;
  }

  if (expiryResult.daysSinceUpdate === 0) {
    return '数据今日更新';
  }

  if (expiryResult.daysSinceUpdate < 7) {
    return `数据${expiryResult.daysSinceUpdate}天前更新`;
  }

  return `数据${expiryResult.daysSinceUpdate}天前更新，请留意官方公告`;
}

module.exports = {
  checkDataExpiry,
  getExpiryWarningLevel,
  checkMultipleGamesExpiry,
  formatExpiryMessage,
  DEFAULT_EXPIRY_THRESHOLD
};