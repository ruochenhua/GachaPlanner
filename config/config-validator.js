/**
 * 游戏配置验证器
 * 确保配置数据完整性和正确性
 */

const { success, error } = require('../utils/result');

// 必填字段列表
const REQUIRED_FIELDS = [
  'gameId', 'name', 'pityType', 'baseRate',
  'hardPity', 'resources', 'version', 'updatedAt'
];

/**
 * 验证游戏配置
 * @param {Object} config - 游戏配置对象
 * @returns {Object} Result对象 {success, data, error}
 */
function validateConfig(config) {
  // 验证必填字段
  const requiredResult = validateRequired(config);
  if (!requiredResult.success) {
    return requiredResult;
  }

  // 验证字段类型
  const typeResult = validateTypes(config);
  if (!typeResult.success) {
    return typeResult;
  }

  // 验证数值范围
  const rangeResult = validateRanges(config);
  if (!rangeResult.success) {
    return rangeResult;
  }

  // 验证保底参数逻辑
  const pityResult = validatePityLogic(config);
  if (!pityResult.success) {
    return pityResult;
  }

  return success(config);
}

/**
 * 验证必填字段存在
 */
function validateRequired(config) {
  for (const field of REQUIRED_FIELDS) {
    if (config[field] === undefined || config[field] === null) {
      return error(`缺少必填字段：${field}`);
    }
  }
  return success(config);
}

/**
 * 验证字段类型正确
 */
function validateTypes(config) {
  if (typeof config.gameId !== 'string') {
    return error('gameId必须为字符串');
  }
  if (typeof config.name !== 'string') {
    return error('name必须为字符串');
  }
  if (typeof config.pityType !== 'string') {
    return error('pityType必须为字符串');
  }
  if (typeof config.baseRate !== 'number') {
    return error('baseRate必须为数字');
  }
  if (typeof config.hardPity !== 'number') {
    return error('hardPity必须为数字');
  }
  if (typeof config.resources !== 'object') {
    return error('resources必须为对象');
  }
  return success(config);
}

/**
 * 验证数值范围合理
 */
function validateRanges(config) {
  if (config.baseRate <= 0 || config.baseRate > 1) {
    return error('基础概率必须在0-1之间');
  }
  if (config.hardPity <= 0) {
    return error('硬保底阈值必须大于0');
  }
  if (config.hardPity > 200) {
    return error('硬保底阈值不能超过200');
  }
  return success(config);
}

/**
 * 验证保底参数逻辑正确
 */
function validatePityLogic(config) {
  if (config.pityType === 'hard' || config.pityType === 'soft') {
    if (config.softPityStart && config.softPityStart >= config.hardPity) {
      return error('软保底起始抽数必须小于硬保底阈值');
    }
    if (config.softPityStart && config.softPityStart < 0) {
      return error('软保底起始抽数不能为负数');
    }
  }
  return success(config);
}

module.exports = {
  validateConfig,
  validateRequired,
  validateTypes,
  validateRanges,
  validatePityLogic
};
