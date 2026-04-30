/**
 * 性能监控工具
 * 用于监控和记录关键操作的响应时间
 */

const PerformanceMonitor = {
  marks: {},

  /**
   * 开始计时
   * @param {String} label 标签名称
   */
  start(label) {
    this.marks[label] = Date.now();
  },

  /**
   * 结束计时并返回耗时
   * @param {String} label 标签名称
   * @param {Number} threshold 阈值（ms），超过则警告
   * @returns {Number} 耗时（ms）
   */
  end(label, threshold = 500) {
    if (!this.marks[label]) {
      console.warn(`[Performance] No start mark found for: ${label}`);
      return 0;
    }

    const duration = Date.now() - this.marks[label];
    delete this.marks[label];

    if (duration > threshold) {
      console.warn(`[Performance] ${label} took ${duration}ms (> ${threshold}ms threshold)`);
    }

    return duration;
  },

  /**
   * 测量函数执行时间
   * @param {String} label 标签名称
   * @param {Function} fn 要测量的函数
   * @param {Number} threshold 阈值（ms）
   * @returns {*} 函数返回值
   */
  measure(label, fn, threshold = 500) {
    this.start(label);
    const result = fn();
    this.end(label, threshold);
    return result;
  },

  /**
   * 测量异步函数执行时间
   * @param {String} label 标签名称
   * @param {Function} fn 要测量的异步函数
   * @param {Number} threshold 阈值（ms）
   * @returns {Promise<*>} 函数返回值
   */
  async measureAsync(label, fn, threshold = 500) {
    this.start(label);
    const result = await fn();
    this.end(label, threshold);
    return result;
  },

  /**
   * 获取当前所有活动的计时标记
   * @returns {Object} 标记对象
   */
  getActiveMarks() {
    return { ...this.marks };
  },

  /**
   * 清除所有计时标记
   */
  clear() {
    this.marks = {};
  }
};

module.exports = PerformanceMonitor;