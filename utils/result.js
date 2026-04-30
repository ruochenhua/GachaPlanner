/**
 * Result模式工具函数
 * 统一返回值格式：{success: boolean, data?: any, error?: string}
 */

/**
 * 成功结果包装
 * @param {any} data - 返回数据
 * @returns {Object} 成功结果对象
 */
function success(data) {
  return { success: true, data };
}

/**
 * 失败结果包装
 * @param {string} message - 错误信息
 * @returns {Object} 失败结果对象
 */
function error(message) {
  return { success: false, error: message };
}

module.exports = {
  success,
  error
};
