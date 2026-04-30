/**
 * 配置验证器
 * 验证游戏配置数据的完整性和正确性
 */

const { success, error } = require('../../utils/result');

// 必填字段列表
const REQUIRED_FIELDS = [
  'gameId',
  'name',
  'pityType',
  'baseRate',
  'version',
  'updatedAt',
  'resources'
];

// 保底类型枚举
const PITY_TYPES = ['hard', 'soft', 'none'];

/**
 * 验证游戏配置
 * @param {Object} config 游戏配置对象
 * @returns {Object} 验证结果 {valid, errors, config}
 */
function validateConfig(config) {
  const errors = [];

  // 验证配置对象存在
  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: '配置必须为对象' }],
      config: null
    };
  }

  // 验证必填字段
  const requiredErrors = validateRequiredFields(config);
  errors.push(...requiredErrors);

  // 验证字段类型
  const typeErrors = validateFieldTypes(config);
  errors.push(...typeErrors);

  // 验证数值范围
  const rangeErrors = validateValueRanges(config);
  errors.push(...rangeErrors);

  // 验证逻辑规则
  const logicErrors = validateLogicRules(config);
  errors.push(...logicErrors);

  return {
    valid: errors.length === 0,
    errors,
    config: errors.length === 0 ? config : null
  };
}

/**
 * 验证必填字段
 * @param {Object} config 配置对象
 * @returns {Array} 错误列表
 */
function validateRequiredFields(config) {
  const errors = [];

  REQUIRED_FIELDS.forEach(field => {
    if (config[field] === undefined || config[field] === null) {
      errors.push({
        field,
        type: 'required',
        message: `缺少必填字段: ${field}`
      });
    }
  });

  // gameId不能为空字符串
  if (config.gameId === '') {
    errors.push({
      field: 'gameId',
      type: 'required',
      message: 'gameId不能为空字符串'
    });
  }

  // name不能为空字符串
  if (config.name === '') {
    errors.push({
      field: 'name',
      type: 'required',
      message: '游戏名称不能为空字符串'
    });
  }

  return errors;
}

/**
 * 验证字段类型
 * @param {Object} config 配置对象
 * @returns {Array} 错误列表
 */
function validateFieldTypes(config) {
  const errors = [];

  // gameId: 字符串
  if (config.gameId !== undefined && typeof config.gameId !== 'string') {
    errors.push({
      field: 'gameId',
      type: 'type',
      message: 'gameId必须为字符串',
      expected: 'string',
      actual: typeof config.gameId
    });
  }

  // name: 字符串
  if (config.name !== undefined && typeof config.name !== 'string') {
    errors.push({
      field: 'name',
      type: 'type',
      message: '游戏名称必须为字符串',
      expected: 'string',
      actual: typeof config.name
    });
  }

  // pityType: 字符串枚举
  if (config.pityType !== undefined) {
    if (typeof config.pityType !== 'string') {
      errors.push({
        field: 'pityType',
        type: 'type',
        message: 'pityType必须为字符串',
        expected: 'string',
        actual: typeof config.pityType
      });
    } else if (!PITY_TYPES.includes(config.pityType)) {
      errors.push({
        field: 'pityType',
        type: 'enum',
        message: `pityType必须为 ${PITY_TYPES.join('/')} 之一`,
        expected: PITY_TYPES,
        actual: config.pityType
      });
    }
  }

  // baseRate: 数值
  if (config.baseRate !== undefined && typeof config.baseRate !== 'number') {
    errors.push({
      field: 'baseRate',
      type: 'type',
      message: '基础概率必须为数值',
      expected: 'number',
      actual: typeof config.baseRate
    });
  }

  // version: 字符串
  if (config.version !== undefined && typeof config.version !== 'string') {
    errors.push({
      field: 'version',
      type: 'type',
      message: '版本号必须为字符串',
      expected: 'string',
      actual: typeof config.version
    });
  }

  // updatedAt: 字符串
  if (config.updatedAt !== undefined && typeof config.updatedAt !== 'string') {
    errors.push({
      field: 'updatedAt',
      type: 'type',
      message: '更新日期必须为字符串',
      expected: 'string',
      actual: typeof config.updatedAt
    });
  }

  // resources: 对象
  if (config.resources !== undefined && typeof config.resources !== 'object') {
    errors.push({
      field: 'resources',
      type: 'type',
      message: '资源配置必须为对象',
      expected: 'object',
      actual: typeof config.resources
    });
  }

  // hardPity: 数值（如果存在）
  if (config.hardPity !== undefined && typeof config.hardPity !== 'number') {
    errors.push({
      field: 'hardPity',
      type: 'type',
      message: '硬保底阈值必须为数值',
      expected: 'number',
      actual: typeof config.hardPity
    });
  }

  // softPityStart: 数值（如果存在）
  if (config.softPityStart !== undefined && typeof config.softPityStart !== 'number') {
    errors.push({
      field: 'softPityStart',
      type: 'type',
      message: '软保底起始抽数必须为数值',
      expected: 'number',
      actual: typeof config.softPityStart
    });
  }

  // softPityIncrement: 数值（如果存在）
  if (config.softPityIncrement !== undefined && typeof config.softPityIncrement !== 'number') {
    errors.push({
      field: 'softPityIncrement',
      type: 'type',
      message: '软保底概率增量必须为数值',
      expected: 'number',
      actual: typeof config.softPityIncrement
    });
  }

  return errors;
}

/**
 * 验证数值范围
 * @param {Object} config 配置对象
 * @returns {Array} 错误列表
 */
function validateValueRanges(config) {
  const errors = [];

  // baseRate: 0-1之间
  if (typeof config.baseRate === 'number') {
    if (config.baseRate <= 0 || config.baseRate > 1) {
      errors.push({
        field: 'baseRate',
        type: 'range',
        message: '基础概率必须在0-1之间',
        expected: '0 < baseRate <= 1',
        actual: config.baseRate
      });
    }
  }

  // hardPity: > 0
  if (typeof config.hardPity === 'number') {
    if (config.hardPity <= 0 || config.hardPity > 1000) {
      errors.push({
        field: 'hardPity',
        type: 'range',
        message: '硬保底阈值必须在1-1000之间',
        expected: '1-1000',
        actual: config.hardPity
      });
    }
  }

  // softPityStart: > 0
  if (typeof config.softPityStart === 'number') {
    if (config.softPityStart <= 0 || config.softPityStart > 1000) {
      errors.push({
        field: 'softPityStart',
        type: 'range',
        message: '软保底起始抽数必须在1-1000之间',
        expected: '1-1000',
        actual: config.softPityStart
      });
    }
  }

  // softPityIncrement: 0-1之间
  if (typeof config.softPityIncrement === 'number') {
    if (config.softPityIncrement < 0 || config.softPityIncrement > 1) {
      errors.push({
        field: 'softPityIncrement',
        type: 'range',
        message: '软保底概率增量必须在0-1之间',
        expected: '0-1',
        actual: config.softPityIncrement
      });
    }
  }

  return errors;
}

/**
 * 验证逻辑规则
 * @param {Object} config 配置对象
 * @returns {Array} 错误列表
 */
function validateLogicRules(config) {
  const errors = [];

  // 硬保底必须有hardPity字段
  if (config.pityType === 'hard') {
    if (config.hardPity === undefined || config.hardPity === null) {
      errors.push({
        field: 'hardPity',
        type: 'logic',
        message: '硬保底类型必须提供hardPity参数',
        condition: 'pityType === "hard"'
      });
    }
  }

  // 软保底必须有softPityStart和softPityIncrement
  if (config.pityType === 'soft') {
    if (config.softPityStart === undefined || config.softPityStart === null) {
      errors.push({
        field: 'softPityStart',
        type: 'logic',
        message: '软保底类型必须提供softPityStart参数',
        condition: 'pityType === "soft"'
      });
    }
    if (config.softPityIncrement === undefined || config.softPityIncrement === null) {
      errors.push({
        field: 'softPityIncrement',
        type: 'logic',
        message: '软保底类型必须提供softPityIncrement参数',
        condition: 'pityType === "soft"'
      });
    }
  }

  // 无保底不应该有保底参数
  if (config.pityType === 'none') {
    if (config.hardPity !== undefined) {
      errors.push({
        field: 'hardPity',
        type: 'logic',
        message: '无保底类型不应提供hardPity参数',
        condition: 'pityType === "none"'
      });
    }
    if (config.softPityStart !== undefined) {
      errors.push({
        field: 'softPityStart',
        type: 'logic',
        message: '无保底类型不应提供softPityStart参数',
        condition: 'pityType === "none"'
      });
    }
  }

  // 软保底起始抽数应小于硬保底阈值（如果都有）
  if (config.pityType === 'hard' &&
      config.softPityStart !== undefined &&
      config.hardPity !== undefined) {
    if (config.softPityStart >= config.hardPity) {
      errors.push({
        field: 'softPityStart',
        type: 'logic',
        message: '软保底起始抽数应小于硬保底阈值',
        expected: `softPityStart < ${config.hardPity}`,
        actual: config.softPityStart
      });
    }
  }

  return errors;
}

/**
 * 验证并返回Result对象
 * @param {Object} config 配置对象
 * @returns {Object} Result对象
 */
function validate(config) {
  const result = validateConfig(config);

  if (result.valid) {
    return success(config);
  }

  const errorMessage = result.errors.map(e => e.message).join('; ');
  return error(`配置验证失败: ${errorMessage}`);
}

module.exports = {
  validateConfig,
  validate,
  validateRequiredFields,
  validateFieldTypes,
  validateValueRanges,
  validateLogicRules,
  REQUIRED_FIELDS,
  PITY_TYPES
};