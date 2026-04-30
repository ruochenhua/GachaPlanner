/**
 * 通知服务
 * 实现模板消息通知功能
 *
 * 【重要】模板消息ID配置说明：
 * 1. 登录微信公众平台 mp.weixin.qq.com
 * 2. 进入"功能" -> "订阅消息"
 * 3. 申请所需模板消息，获取模板ID
 * 4. 将下方 TEMPLATE_IDS 替换为真实的模板ID
 * 5. 或者在调用前通过 notificationService.templateIds.xxx = '真实ID' 动态设置
 */

const { success, error } = require('../utils/result');

// 模板消息ID配置
// 【TODO】请在微信公众平台申请模板消息后替换为真实ID
const TEMPLATE_IDS = {
  // 卡池开启提醒模板
  // 所需字段：thing1(卡池名称), time2(开启时间), thing3(提示消息)
  poolOpening: 'TEMPLATE_ID_POOL',
  // 囤积进度提醒模板
  // 所需字段：thing1(游戏名称), number2(进度百分比), thing3(提示消息)
  hoardingProgress: 'TEMPLATE_ID_HOARDING',
  // 规划达成提醒模板
  // 所需字段：thing1(卡池名称), number2(达成概率), thing3(提示消息)
  planningAchieved: 'TEMPLATE_ID_ACHIEVED'
};

// 授权状态存储Key
const AUTH_KEY = 'notification_auth';

/**
 * 通知服务类
 */
class NotificationService {
  constructor() {
    this.authStatus = null;
    this.templateIds = TEMPLATE_IDS;
  }

  /**
   * 初始化授权状态
   */
  init() {
    this.loadAuthStatus();
  }

  /**
   * 加载授权状态
   */
  loadAuthStatus() {
    try {
      this.authStatus = wx.getStorageSync(AUTH_KEY) || {
        authorized: false,
        templates: {}
      };
      return success(this.authStatus);
    } catch (err) {
      console.error('加载授权状态失败:', err);
      this.authStatus = { authorized: false, templates: {} };
      return error(`加载授权状态失败：${err.message}`);
    }
  }

  /**
   * 请求模板消息授权
   * @param {Array} templateIds - 模板ID列表
   * @returns {Promise<Object>} Result对象
   */
  requestAuthorization(templateIds) {
    return new Promise((resolve) => {
      wx.requestSubscribeMessage({
        tmplIds: templateIds || Object.values(this.templateIds),
        success: (res) => {
          const authorized = {};
          templateIds.forEach(id => {
            authorized[id] = res[id] === 'accept';
          });

          // 保存授权状态
          this.authStatus = {
            authorized: true,
            templates: authorized,
            authorizedAt: new Date().toISOString()
          };
          this.saveAuthStatus();

          resolve(success(this.authStatus));
        },
        fail: (err) => {
          console.error('请求授权失败:', err);
          resolve(error(`请求授权失败：${err.errMsg}`));
        }
      });
    });
  }

  /**
   * 保存授权状态
   */
  saveAuthStatus() {
    try {
      wx.setStorageSync(AUTH_KEY, this.authStatus);
    } catch (err) {
      console.error('保存授权状态失败:', err);
    }
  }

  /**
   * 检查授权状态
   * @param {string} templateId - 模板ID
   * @returns {boolean} 是否已授权
   */
  isAuthorized(templateId) {
    if (!this.authStatus || !this.authStatus.authorized) {
      return false;
    }
    return this.authStatus.templates[templateId] === true;
  }

  /**
   * 发送模板消息
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<Object>} Result对象
   */
  async sendNotification(notificationData) {
    try {
      const { templateId, content, page } = notificationData;

      // 检查授权
      if (!this.isAuthorized(templateId)) {
        // 尝试请求授权
        const authResult = await this.requestAuthorization([templateId]);
        if (!authResult.success || !this.isAuthorized(templateId)) {
          return error('未授权发送模板消息');
        }
      }

      // 构建消息数据
      const messageData = this.buildMessageData(templateId, content);

      // 发送消息（需要在用户点击触发后调用）
      // 微信小程序限制：只能在用户点击按钮后触发发送
      // 这里返回配置供页面使用
      return success({
        templateId,
        data: messageData,
        page: page || '/pages/planning/planning',
        sendable: true
      });
    } catch (err) {
      console.error('发送通知失败:', err);
      return error(`发送通知失败：${err.message}`);
    }
  }

  /**
   * 构建消息数据
   * @param {string} templateId - 模板ID
   * @param {Object} content - 内容数据
   * @returns {Object} 消息数据
   */
  buildMessageData(templateId, content) {
    // 根据不同模板类型构建数据
    if (templateId === this.templateIds.poolOpening) {
      return {
        thing1: { value: content.poolName || '卡池开启' },
        time2: { value: content.openDate || '' },
        thing3: { value: content.message || '即将开启，请关注' }
      };
    }

    if (templateId === this.templateIds.hoardingProgress) {
      return {
        thing1: { value: content.gameName || '囤积进度' },
        number2: { value: `${content.progress}%` || '0%' },
        thing3: { value: content.message || '囤积目标即将达成' }
      };
    }

    if (templateId === this.templateIds.planningAchieved) {
      return {
        thing1: { value: content.poolName || '规划达成' },
        number2: { value: `${content.probability}%` || '0%' },
        thing3: { value: content.message || '规划目标已达成' }
      };
    }

    // 默认数据
    return {
      thing1: { value: content.title || '通知' },
      thing2: { value: content.message || '' }
    };
  }

  /**
   * 发送卡池开启通知
   * @param {Object} poolData - 卡池数据
   * @returns {Promise<Object>} Result对象
   */
  async sendPoolOpeningNotification(poolData) {
    return this.sendNotification({
      templateId: this.templateIds.poolOpening,
      content: {
        poolName: poolData.poolName,
        openDate: poolData.openDate,
        message: `${poolData.gameName}卡池即将开启，准备好资源了吗？`
      },
      page: `/pages/planning/planning?poolId=${poolData.poolId}`
    });
  }

  /**
   * 发送囤积进度通知
   * @param {Object} hoardingData - 囤积数据
   * @returns {Promise<Object>} Result对象
   */
  async sendHoardingProgressNotification(hoardingData) {
    return this.sendNotification({
      templateId: this.templateIds.hoardingProgress,
      content: {
        gameName: hoardingData.gameName,
        progress: hoardingData.progress,
        message: `当前${hoardingData.currentResource}，目标${hoardingData.targetResource}`
      },
      page: `/pages/planning/planning?gameId=${hoardingData.gameId}`
    });
  }

  /**
   * 获取通知设置
   * @returns {Object} 通知设置
   */
  getNotificationSettings() {
    return this.authStatus || { authorized: false, templates: {} };
  }

  /**
   * 更新通知设置
   * @param {Object} settings - 新设置
   * @returns {Object} Result对象
   */
  updateNotificationSettings(settings) {
    try {
      this.authStatus = {
        ...this.authStatus,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      this.saveAuthStatus();
      return success(this.authStatus);
    } catch (err) {
      console.error('更新通知设置失败:', err);
      return error(`更新通知设置失败：${err.message}`);
    }
  }

  /**
   * 清除授权状态
   * @returns {Object} Result对象
   */
  clearAuthorization() {
    try {
      this.authStatus = { authorized: false, templates: {} };
      wx.removeStorageSync(AUTH_KEY);
      return success(true);
    } catch (err) {
      console.error('清除授权状态失败:', err);
      return error(`清除授权状态失败：${err.message}`);
    }
  }

  /**
   * 获取发送历史
   * @returns {Array} 发送历史列表
   */
  getSendHistory() {
    try {
      return wx.getStorageSync('notification_history') || [];
    } catch (err) {
      console.error('获取发送历史失败:', err);
      return [];
    }
  }

  /**
   * 记录发送历史
   * @param {Object} notification - 通知数据
   */
  recordSendHistory(notification) {
    try {
      const history = this.getSendHistory();
      history.push({
        ...notification,
        sentAt: new Date().toISOString()
      });
      wx.setStorageSync('notification_history', history);
    } catch (err) {
      console.error('记录发送历史失败:', err);
    }
  }

  /**
   * 显示授权请求弹窗
   * @returns {Promise<Object>} Result对象
   */
  showAuthRequestPopup() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '开启通知',
        content: '是否接收卡池开启、囤积进度等提醒通知？',
        success: (res) => {
          if (res.confirm) {
            this.requestAuthorization(Object.values(this.templateIds))
              .then(resolve);
          } else {
            resolve(error('用户拒绝授权'));
          }
        }
      });
    });
  }
}

// 导出单例实例
const notificationService = new NotificationService();
notificationService.init();
module.exports = notificationService;