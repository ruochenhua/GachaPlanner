/**
 * 时间格式化工具
 * 提供相对时间显示功能
 */

/**
 * 格式化相对时间
 * @param {number} timestamp 时间戳
 * @returns {string} 相对时间字符串
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = now - timestamp;

  // 刚刚（小于1分钟）
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // X分钟前（小于1小时）
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // X小时前（小于24小时）
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // X天前（小于7天）
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }

  // 超过7天显示日期
  return formatDate(timestamp);
}

/**
 * 格式化日期
 * @param {number} timestamp 时间戳
 * @returns {string} 日期字符串
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间
 * @param {number} timestamp 时间戳
 * @returns {string} 日期时间字符串
 */
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化时间（仅时分）
 * @param {number} timestamp 时间戳
 * @returns {string} 时间字符串
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * 获取今天的开始时间戳
 * @returns {number} 时间戳
 */
function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * 获取本周的开始时间戳
 * @returns {number} 时间戳
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setDate(now.getDate() - day + 1);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * 判断是否是今天
 * @param {number} timestamp 时间戳
 * @returns {boolean} 是否是今天
 */
function isToday(timestamp) {
  return timestamp >= getTodayStart();
}

/**
 * 判断是否是本周
 * @param {number} timestamp 时间戳
 * @returns {boolean} 是否是本周
 */
function isThisWeek(timestamp) {
  return timestamp >= getWeekStart();
}

module.exports = {
  formatRelativeTime,
  formatDate,
  formatDateTime,
  formatTime,
  getTodayStart,
  getWeekStart,
  isToday,
  isThisWeek
};