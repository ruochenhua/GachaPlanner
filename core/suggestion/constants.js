// core/suggestion/constants.js
// 建议生成引擎常量定义

// 建议类型枚举
const SuggestionType = {
  PRIORITY: 'priority',     // 优先级建议
  RISK: 'risk',             // 风险提示
  STRATEGY: 'strategy'      // 策略调整建议
};

// 建议级别枚举
const SuggestionLevel = {
  INFO: 'info',             // 信息（绿色）
  WARNING: 'warning',       // 警告（黄色）
  DANGER: 'danger'          // 危险（红色）
};

// 建议图标映射
const SuggestionIcon = {
  SUCCESS: '✅',
  WARNING: '⚠️',
  DANGER: '❌',
  IDEA: '💡',
  TARGET: '🎯'
};

// 优先级计算权重
const PriorityWeight = {
  PROBABILITY: 0.7,         // 概率权重70%
  URGENCY: 0.3              // 时间紧迫性权重30%
};

module.exports = {
  SuggestionType,
  SuggestionLevel,
  SuggestionIcon,
  PriorityWeight
};
