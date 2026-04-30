/**
 * 分享服务
 * 实现微信好友分享和朋友圈分享功能
 */

const { success, error } = require('../utils/result');

// 分享卡片配置模板
const SHARE_TEMPLATE = {
  // 默认分享标题模板
  titleTemplate: '{gameName} {poolName}规划 - {probability}%达成概率',
  // 默认分享描述模板
  descTemplate: 'GachaPlaner帮你科学规划抽卡，提高目标达成概率',
  // 默认分享路径
  defaultPath: '/pages/planning/planning'
};

/**
 * 分享服务类
 */
class ShareService {
  constructor() {
    this.shareConfig = null;
  }

  /**
   * 分享给微信好友
   * @param {Object} shareData - 分享数据
   * @returns {Promise<Object>} Result对象
   */
  shareToFriend(shareData) {
    const { title, path, imageUrl, desc } = this.buildShareConfig(shareData);

    // 微信小程序使用 onShareAppMessage 定义分享内容
    // 此方法返回分享配置供页面使用
    return success({
      title,
      path,
      imageUrl,
      desc,
      success: () => {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
        this.recordShareStats('friend', shareData);
      },
      fail: (err) => {
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        });
        console.error('分享失败:', err);
      }
    });
  }

  /**
   * 生成分享卡片配置
   * @param {Object} planningData - 规划数据
   * @returns {Object} 分享配置
   */
  buildShareConfig(planningData) {
    const { gameName, poolName, probability, gameId, poolId } = planningData;

    // 构建标题
    const title = SHARE_TEMPLATE.titleTemplate
      .replace('{gameName}', gameName || '')
      .replace('{poolName}', poolName || '')
      .replace('{probability}', probability || 0);

    // 构建路径（带参数）
    const path = poolId
      ? `${SHARE_TEMPLATE.defaultPath}?gameId=${gameId}&poolId=${poolId}`
      : SHARE_TEMPLATE.defaultPath;

    // 描述
    const desc = SHARE_TEMPLATE.descTemplate;

    // 图片（优先使用动态生成的图片，其次使用默认分享图）
    // 注意：/assets/share-images/default-share.png 需要提前准备
    // 如果没有默认图片，建议在分享前调用 generateShareThumbnail 生成
    const imageUrl = planningData.shareImage || '/assets/share-images/default-share.png';

    this.shareConfig = { title, path, imageUrl, desc };

    return this.shareConfig;
  }

  /**
   * 自定义分享内容
   * @param {Object} customConfig - 自定义配置
   * @returns {Object} 更新后的分享配置
   */
  customizeShare(customConfig) {
    if (!this.shareConfig) {
      return error('请先初始化分享配置');
    }

    const { title, desc, imageUrl } = customConfig;

    if (title) {
      this.shareConfig.title = title;
    }
    if (desc) {
      this.shareConfig.desc = desc;
    }
    if (imageUrl) {
      this.shareConfig.imageUrl = imageUrl;
    }

    return success(this.shareConfig);
  }

  /**
   * 生成分享缩略图
   * @param {Object} planningData - 规划数据
   * @returns {Promise<Object>} Result对象 {success, data: {tempFilePath}}
   */
  async generateShareThumbnail(planningData) {
    try {
      // 引用图片生成服务
      const imageGenerator = require('./image-generator');

      // 生成小尺寸分享图（5:4比例，微信推荐）
      const result = await imageGenerator.generatePlanningImage(
        {
          ...planningData,
          // 分享图简化内容
          simplified: true
        },
        'wechat'
      );

      if (result.success) {
        return success({
          tempFilePath: result.data.tempFilePath
        });
      }

      return result;
    } catch (err) {
      console.error('生成分享缩略图失败:', err);
      return error(`生成分享缩略图失败：${err.message}`);
    }
  }

  /**
   * 朋友圈分享（保存图片到相册）
   * @param {Object} planningData - 规划数据
   * @param {string} imageType - 图片类型 'moments' | 'momentsWide'
   * @returns {Promise<Object>} Result对象
   */
  async shareToMoments(planningData, imageType = 'moments') {
    try {
      const imageGenerator = require('./image-generator');

      // 生成朋友圈图片
      const result = await imageGenerator.generatePlanningImage(planningData, imageType);

      if (!result.success) {
        return result;
      }

      // 保存到相册
      const saveResult = await imageGenerator.saveToAlbum(result.data.tempFilePath);

      if (saveResult.success) {
        // 显示分享引导
        this.showMomentsGuide();

        this.recordShareStats('moments', planningData);

        return success({
          imagePath: result.data.tempFilePath,
          message: '图片已保存到相册，请在朋友圈发布'
        });
      }

      return saveResult;
    } catch (err) {
      console.error('朋友圈分享失败:', err);
      return error(`朋友圈分享失败：${err.message}`);
    }
  }

  /**
   * 显示朋友圈分享引导
   */
  showMomentsGuide() {
    wx.showModal({
      title: '分享到朋友圈',
      content: '图片已保存到相册。\n\n发布步骤：\n1. 打开微信朋友圈\n2. 点击发布按钮\n3. 选择刚保存的图片\n4. 编辑并发布',
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * 记录分享统计
   * @param {string} type - 分享类型 'friend' | 'moments'
   * @param {Object} data - 分享数据
   */
  recordShareStats(type, data) {
    try {
      const stats = wx.getStorageSync('share_stats') || {
        friend: 0,
        moments: 0,
        lastShareTime: null
      };

      stats[type] = (stats[type] || 0) + 1;
      stats.lastShareTime = new Date().toISOString();

      wx.setStorageSync('share_stats', stats);

      console.log(`✓ 分享统计已记录: ${type}`);
    } catch (err) {
      console.error('记录分享统计失败:', err);
    }
  }

  /**
   * 获取分享统计
   * @returns {Object} 分享统计数据
   */
  getShareStats() {
    try {
      return wx.getStorageSync('share_stats') || {
        friend: 0,
        moments: 0,
        lastShareTime: null
      };
    } catch (err) {
      console.error('获取分享统计失败:', err);
      return { friend: 0, moments: 0, lastShareTime: null };
    }
  }

  /**
   * 预览分享卡片
   * @param {Object} shareConfig - 分享配置
   */
  previewShareCard(shareConfig) {
    wx.previewImage({
      current: shareConfig.imageUrl,
      urls: [shareConfig.imageUrl]
    });
  }
}

// 导出单例实例
const shareService = new ShareService();
module.exports = shareService;