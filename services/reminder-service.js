/**
 * 提醒服务
 * 实现卡池开启提醒和资源囤积提醒功能
 */

const { success, error } = require('../utils/result');

// 提醒存储Key
const REMINDER_KEY = 'reminders';
const HOARDING_KEY = 'hoarding_reminders';

/**
 * 提醒服务类
 */
class ReminderService {
  constructor() {
    this.reminders = [];
    this.hoardingReminders = [];
  }

  /**
   * 初始化提醒数据
   */
  init() {
    this.loadReminders();
    this.loadHoardingReminders();
  }

  /**
   * 加载卡池提醒
   */
  loadReminders() {
    try {
      const data = wx.getStorageSync(REMINDER_KEY);
      this.reminders = data || [];
      return success(this.reminders);
    } catch (err) {
      console.error('加载提醒失败:', err);
      this.reminders = [];
      return error(`加载提醒失败：${err.message}`);
    }
  }

  /**
   * 加载囤积提醒
   */
  loadHoardingReminders() {
    try {
      const data = wx.getStorageSync(HOARDING_KEY);
      this.hoardingReminders = data || [];
      return success(this.hoardingReminders);
    } catch (err) {
      console.error('加载囤积提醒失败:', err);
      this.hoardingReminders = [];
      return error(`加载囤积提醒失败：${err.message}`);
    }
  }

  /**
   * 创建卡池开启提醒
   * @param {Object} reminderData - 提醒数据
   * @returns {Object} Result对象
   */
  createReminder(reminderData) {
    try {
      const {
        poolId,
        poolName,
        gameId,
        gameName,
        openDate,
        reminderTime,
        advanceDays
      } = reminderData;

      // 验证必填字段
      if (!poolId || !openDate) {
        return error('缺少必填字段：poolId或openDate');
      }

      const reminder = {
        id: `reminder_${Date.now()}`,
        poolId,
        poolName: poolName || '未知卡池',
        gameId,
        gameName: gameName || '未知游戏',
        openDate,
        reminderTime: reminderTime || this.calculateReminderTime(openDate, advanceDays),
        advanceDays: advanceDays || 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.reminders.push(reminder);
      this.saveReminders();

      return success(reminder);
    } catch (err) {
      console.error('创建提醒失败:', err);
      return error(`创建提醒失败：${err.message}`);
    }
  }

  /**
   * 计算提醒时间
   * @param {string} openDate - 开启日期
   * @param {number} advanceDays - 提前天数
   * @returns {string} 提醒时间
   */
  calculateReminderTime(openDate, advanceDays) {
    const open = new Date(openDate);
    open.setDate(open.getDate() - (advanceDays || 1));
    open.setHours(9, 0, 0, 0);
    return open.toISOString().slice(0, 16).replace('T', ' ');
  }

  /**
   * 获取提醒列表
   * @param {Object} filter - 筛选条件
   * @returns {Object} Result对象
   */
  getReminders(filter = {}) {
    try {
      let list = [...this.reminders];

      // 按游戏筛选
      if (filter.gameId) {
        list = list.filter(r => r.gameId === filter.gameId);
      }

      // 按状态筛选
      if (filter.status) {
        list = list.filter(r => r.status === filter.status);
      }

      // 按时间排序（最近的在前，降序）
      list.sort((a, b) => new Date(b.openDate) - new Date(a.openDate));

      return success(list);
    } catch (err) {
      console.error('获取提醒列表失败:', err);
      return error(`获取提醒列表失败：${err.message}`);
    }
  }

  /**
   * 更新提醒
   * @param {string} id - 提醒ID
   * @param {Object} updates - 更新内容
   * @returns {Object} Result对象
   */
  updateReminder(id, updates) {
    try {
      const index = this.reminders.findIndex(r => r.id === id);
      if (index === -1) {
        return error('提醒不存在');
      }

      const reminder = this.reminders[index];
      Object.assign(reminder, updates, {
        updatedAt: new Date().toISOString()
      });

      // 如果更新了开启日期或提前天数，重新计算提醒时间
      if (updates.openDate || updates.advanceDays) {
        reminder.reminderTime = this.calculateReminderTime(
          reminder.openDate,
          reminder.advanceDays
        );
      }

      this.saveReminders();
      return success(reminder);
    } catch (err) {
      console.error('更新提醒失败:', err);
      return error(`更新提醒失败：${err.message}`);
    }
  }

  /**
   * 删除提醒
   * @param {string} id - 提醒ID
   * @returns {Object} Result对象
   */
  deleteReminder(id) {
    try {
      const index = this.reminders.findIndex(r => r.id === id);
      if (index === -1) {
        return error('提醒不存在');
      }

      this.reminders.splice(index, 1);
      this.saveReminders();

      return success(true);
    } catch (err) {
      console.error('删除提醒失败:', err);
      return error(`删除提醒失败：${err.message}`);
    }
  }

  /**
   * 保存提醒到存储
   */
  saveReminders() {
    try {
      wx.setStorageSync(REMINDER_KEY, this.reminders);
    } catch (err) {
      console.error('保存提醒失败:', err);
    }
  }

  /**
   * 创建囤积提醒
   * @param {Object} hoardingData - 囤积数据
   * @returns {Object} Result对象
   */
  createHoardingReminder(hoardingData) {
    try {
      const {
        gameId,
        gameName,
        targetResource,
        currentResource,
        reminderThreshold,
        periodicReminder
      } = hoardingData;

      if (!gameId || !targetResource) {
        return error('缺少必填字段：gameId或targetResource');
      }

      const reminder = {
        id: `hoarding_${Date.now()}`,
        gameId,
        gameName: gameName || '未知游戏',
        targetResource,
        currentResource: currentResource || 0,
        reminderThreshold: reminderThreshold || Math.floor(targetResource * 0.9),
        periodicReminder: periodicReminder || 'none', // none/weekly/monthly
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.hoardingReminders.push(reminder);
      this.saveHoardingReminders();

      return success(reminder);
    } catch (err) {
      console.error('创建囤积提醒失败:', err);
      return error(`创建囤积提醒失败：${err.message}`);
    }
  }

  /**
   * 获取囤积提醒列表
   * @param {Object} filter - 筛选条件
   * @returns {Object} Result对象
   */
  getHoardingReminders(filter = {}) {
    try {
      let list = [...this.hoardingReminders];

      if (filter.gameId) {
        list = list.filter(r => r.gameId === filter.gameId);
      }

      if (filter.status) {
        list = list.filter(r => r.status === filter.status);
      }

      return success(list);
    } catch (err) {
      console.error('获取囤积提醒列表失败:', err);
      return error(`获取囤积提醒列表失败：${err.message}`);
    }
  }

  /**
   * 更新囤积提醒
   * @param {string} id - 提醒ID
   * @param {Object} updates - 更新内容
   * @returns {Object} Result对象
   */
  updateHoardingReminder(id, updates) {
    try {
      const index = this.hoardingReminders.findIndex(r => r.id === id);
      if (index === -1) {
        return error('囤积提醒不存在');
      }

      const reminder = this.hoardingReminders[index];
      Object.assign(reminder, updates, {
        updatedAt: new Date().toISOString()
      });

      this.saveHoardingReminders();
      return success(reminder);
    } catch (err) {
      console.error('更新囤积提醒失败:', err);
      return error(`更新囤积提醒失败：${err.message}`);
    }
  }

  /**
   * 删除囤积提醒
   * @param {string} id - 提醒ID
   * @returns {Object} Result对象
   */
  deleteHoardingReminder(id) {
    try {
      const index = this.hoardingReminders.findIndex(r => r.id === id);
      if (index === -1) {
        return error('囤积提醒不存在');
      }

      this.hoardingReminders.splice(index, 1);
      this.saveHoardingReminders();

      return success(true);
    } catch (err) {
      console.error('删除囤积提醒失败:', err);
      return error(`删除囤积提醒失败：${err.message}`);
    }
  }

  /**
   * 保存囤积提醒到存储
   */
  saveHoardingReminders() {
    try {
      wx.setStorageSync(HOARDING_KEY, this.hoardingReminders);
    } catch (err) {
      console.error('保存囤积提醒失败:', err);
    }
  }

  /**
   * 计算囤积进度
   * @param {Object} reminder - 囤积提醒
   * @returns {Object} 进度信息
   */
  calculateProgress(reminder) {
    const { targetResource, currentResource } = reminder;

    // 防止除零
    if (!targetResource || targetResource <= 0) {
      return {
        progress: 0,
        remaining: 0,
        progressColor: 'danger'
      };
    }

    const progress = Math.min(100, (currentResource / targetResource) * 100);
    const remaining = Math.max(0, targetResource - currentResource);

    // 进度颜色编码
    let progressColor = 'danger';
    if (progress >= 80) {
      progressColor = 'success';
    } else if (progress >= 50) {
      progressColor = 'warning';
    }

    return {
      progress: Math.round(progress),
      remaining,
      progressColor
    };
  }

  /**
   * 检查到期提醒
   * @returns {Array} 到期提醒列表
   */
  checkDueReminders() {
    const now = new Date();
    const dueReminders = [];

    // 检查卡池提醒
    this.reminders.forEach(reminder => {
      if (reminder.status !== 'active') return;

      const reminderDate = new Date(reminder.reminderTime);
      if (reminderDate <= now) {
        dueReminders.push({
          type: 'pool',
          reminder
        });
      }
    });

    // 检查囤积提醒（目标达成）
    this.hoardingReminders.forEach(reminder => {
      if (reminder.status !== 'active') return;

      const { currentResource, reminderThreshold, targetResource } = reminder;
      if (currentResource >= reminderThreshold) {
        dueReminders.push({
          type: 'hoarding',
          reminder
        });
      }
    });

    return dueReminders;
  }

  /**
   * 触发提醒通知
   * @param {Object} dueReminder - 到期提醒
   */
  triggerReminder(dueReminder) {
    const { type, reminder } = dueReminder;

    if (type === 'pool') {
      wx.showModal({
        title: '卡池开启提醒',
        content: `${reminder.gameName} ${reminder.poolName}将在${reminder.advanceDays}天后开启！\n开启日期：${reminder.openDate}`,
        showCancel: false,
        confirmText: '知道了'
      });

      // 标记提醒已触发
      this.updateReminder(reminder.id, { status: 'fired' });
    } else if (type === 'hoarding') {
      const progress = this.calculateProgress(reminder);
      wx.showModal({
        title: '囤积进度提醒',
        content: `${reminder.gameName}资源囤积进度已达${progress.progress}%！\n当前：${reminder.currentResource} / 目标：${reminder.targetResource}`,
        showCancel: false,
        confirmText: '知道了'
      });
    }

    // 记录提醒历史
    this.recordReminderHistory(dueReminder);
  }

  /**
   * 记录提醒历史
   * @param {Object} dueReminder - 到期提醒
   */
  recordReminderHistory(dueReminder) {
    try {
      const history = wx.getStorageSync('reminder_history') || [];
      history.push({
        ...dueReminder,
        triggeredAt: new Date().toISOString()
      });
      wx.setStorageSync('reminder_history', history);
    } catch (err) {
      console.error('记录提醒历史失败:', err);
    }
  }

  /**
   * 获取提醒历史
   * @returns {Array} 提醒历史列表
   */
  getReminderHistory() {
    try {
      return wx.getStorageSync('reminder_history') || [];
    } catch (err) {
      console.error('获取提醒历史失败:', err);
      return [];
    }
  }
}

// 导出单例实例
const reminderService = new ReminderService();
reminderService.init();
module.exports = reminderService;