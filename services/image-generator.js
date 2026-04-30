/**
 * 图片生成服务
 * 使用Canvas API生成规划结果图片
 */

const { success, error } = require('../utils/result');

// 图片尺寸配置
const IMAGE_CONFIG = {
  // 微信分享尺寸
  wechat: {
    width: 750,
    height: 1334
  },
  // 朋友圈正方形尺寸
  moments: {
    width: 750,
    height: 750
  },
  // 朋友圈宽图尺寸
  momentsWide: {
    width: 1080,
    height: 1920
  }
};

// 莫兰迪暖色系
const COLORS = {
  primary: '#C4A77D',
  primaryLight: '#D4BC99',
  success: '#7FB069',
  warning: '#E4C786',
  danger: '#C47070',
  gray50: '#FAF9F7',
  gray100: '#F5F3F0',
  gray200: '#E8E4DE',
  gray600: '#7A7168',
  gray700: '#5C544D',
  gray800: '#3E3833',
  white: '#FFFFFF'
};

/**
 * 图片生成器类
 */
class ImageGenerator {
  constructor() {
    this.ctx = null;
    this.canvas = null;
  }

  /**
   * 生成规划结果图片
   * @param {Object} planningData - 规划数据
   * @param {string} type - 图片类型 'wechat' | 'moments' | 'momentsWide'
   * @returns {Promise<Object>} Result对象 {success, data: {tempFilePath}}
   */
  async generatePlanningImage(planningData, type = 'wechat') {
    try {
      const config = IMAGE_CONFIG[type] || IMAGE_CONFIG.wechat;

      // 创建离屏Canvas
      const { canvas, ctx } = await this.createOffscreenCanvas(config.width, config.height);
      this.canvas = canvas;
      this.ctx = ctx;

      // 绘制背景
      this.drawBackground(config);

      // 绘制头部（游戏图标 + 标题）
      this.drawHeader(planningData, config);

      // 绘制概率区域
      this.drawProbabilitySection(planningData, config);

      // 绘制建议区域
      this.drawSuggestionSection(planningData, config);

      // 绘制图表区域
      await this.drawChartSection(planningData, config);

      // 绘制底部品牌区域
      this.drawFooter(planningData, config);

      // 导出图片
      const tempFilePath = await this.exportImage(canvas);

      return success({ tempFilePath, width: config.width, height: config.height });
    } catch (err) {
      console.error('生成图片失败:', err);
      return error(`生成图片失败：${err.message}`);
    }
  }

  /**
   * 创建离屏Canvas
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {Promise<Object>} {canvas, ctx}
   */
  createOffscreenCanvas(width, height) {
    return new Promise((resolve, reject) => {
      // 检查基础库版本是否支持 wx.createOffscreenCanvas
      const systemInfo = wx.getSystemInfoSync();
      const SDKVersion = systemInfo.SDKVersion || '2.0.0';
      const supportsOffscreen = this.compareVersion(SDKVersion, '2.16.0') >= 0;

      // 首先尝试使用页面Canvas节点
      const query = wx.createSelectorQuery();
      query.select('#shareCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = systemInfo.pixelRatio;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            resolve({ canvas, ctx });
          } else if (supportsOffscreen) {
            // 使用离屏Canvas（基础库 2.16.0+）
            try {
              const canvas = wx.createOffscreenCanvas({
                type: '2d',
                width,
                height
              });
              const ctx = canvas.getContext('2d');
              resolve({ canvas, ctx });
            } catch (err) {
              reject(new Error('创建Canvas失败，请确保页面包含#shareCanvas节点'));
            }
          } else {
            // 低版本基础库不支持离屏Canvas
            reject(new Error('当前微信版本不支持图片生成，请升级微信'));
          }
        });
    });
  }

  /**
   * 比较版本号
   * @param {string} v1 - 版本1
   * @param {string} v2 - 版本2
   * @returns {number} 1表示v1>v2, -1表示v1<v2, 0表示相等
   */
  compareVersion(v1, v2) {
    const parts1 = v1.split('.');
    const parts2 = v2.split('.');
    for (let i = 0; i < 3; i++) {
      const num1 = parseInt(parts1[i] || 0);
      const num2 = parseInt(parts2[i] || 0);
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  /**
   * 绘制背景
   */
  drawBackground(config) {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.gray50;
    ctx.fillRect(0, 0, config.width, config.height);
  }

  /**
   * 绘制头部
   */
  drawHeader(planningData, config) {
    const ctx = this.ctx;
    const { gameName, poolName } = planningData;

    // 头部背景
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, config.width, 120);

    // 游戏名称
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = COLORS.gray800;
    ctx.textAlign = 'left';
    ctx.fillText(`${gameName} - ${poolName}`, 40, 70);

    // 分隔线
    ctx.strokeStyle = COLORS.gray200;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.lineTo(config.width - 40, 110);
    ctx.stroke();
  }

  /**
   * 绘制概率区域
   */
  drawProbabilitySection(planningData, config) {
    const ctx = this.ctx;
    const { probability, riskLevel } = planningData;
    const startY = 140;

    // 概率卡片背景
    ctx.fillStyle = COLORS.gray100;
    this.roundRect(ctx, 40, startY, config.width - 80, 180, 12);
    ctx.fill();

    // 概率数字
    const probColor = this.getProbabilityColor(probability);
    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = probColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${probability}%`, config.width / 2, startY + 100);

    // 风险等级
    ctx.font = '24px sans-serif';
    ctx.fillStyle = COLORS.gray600;
    ctx.fillText(`风险等级：${riskLevel}`, config.width / 2, startY + 150);
  }

  /**
   * 绘制建议区域
   */
  drawSuggestionSection(planningData, config) {
    const ctx = this.ctx;
    const { suggestion } = planningData;
    const startY = 340;

    // 建议卡片背景
    ctx.fillStyle = COLORS.white;
    this.roundRect(ctx, 40, startY, config.width - 80, 100, 8);
    ctx.fill();

    // 建议边框
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 40, startY, config.width - 80, 100, 8);
    ctx.stroke();

    // 建议图标（使用文字替代emoji，避免Canvas兼容问题）
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = COLORS.primary;
    ctx.textAlign = 'left';
    ctx.fillText('建议', 60, startY + 35);

    // 建议文字
    ctx.font = '22px sans-serif';
    ctx.fillStyle = COLORS.gray700;
    ctx.fillText(suggestion || '暂无建议', 60, startY + 65);
  }

  /**
   * 绘制图表区域
   */
  async drawChartSection(planningData, config) {
    const ctx = this.ctx;
    const { distribution } = planningData;
    const startY = 460;
    const chartHeight = 300;

    if (!distribution || distribution.length === 0) {
      return;
    }

    // 图表背景
    ctx.fillStyle = COLORS.white;
    this.roundRect(ctx, 40, startY, config.width - 80, chartHeight, 8);
    ctx.fill();

    // 绘制坐标轴
    this.drawChartAxes(config, startY, chartHeight);

    // 绘制概率曲线
    this.drawProbabilityCurve(distribution, config, startY, chartHeight);
  }

  /**
   * 绘制图表坐标轴
   */
  drawChartAxes(config, startY, chartHeight) {
    const ctx = this.ctx;
    const margin = { left: 60, right: 40, top: 30, bottom: 40 };
    const chartWidth = config.width - 80 - margin.left - margin.right;
    const chartHeightInner = chartHeight - margin.top - margin.bottom;

    // X轴
    ctx.strokeStyle = COLORS.gray200;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40 + margin.left, startY + chartHeight - margin.bottom);
    ctx.lineTo(config.width - 40 - margin.right, startY + chartHeight - margin.bottom);
    ctx.stroke();

    // Y轴
    ctx.beginPath();
    ctx.moveTo(40 + margin.left, startY + margin.top);
    ctx.lineTo(40 + margin.left, startY + chartHeight - margin.bottom);
    ctx.stroke();

    // X轴标签
    ctx.font = '18px sans-serif';
    ctx.fillStyle = COLORS.gray600;
    ctx.textAlign = 'center';
    const xLabels = [0, 25, 50, 75, 100];
    xLabels.forEach((label, index) => {
      const x = 40 + margin.left + (index / 4) * chartWidth;
      ctx.fillText(`${label}`, x, startY + chartHeight - 10);
    });

    // Y轴标签
    ctx.textAlign = 'right';
    const yLabels = ['0%', '50%', '100%'];
    yLabels.forEach((label, index) => {
      const y = startY + chartHeight - margin.bottom - (index / 2) * chartHeightInner;
      ctx.fillText(label, 40 + margin.left - 10, y + 5);
    });
  }

  /**
   * 绘制概率曲线
   */
  drawProbabilityCurve(distribution, config, startY, chartHeight) {
    const ctx = this.ctx;
    const margin = { left: 60, right: 40, top: 30, bottom: 40 };
    const chartWidth = config.width - 80 - margin.left - margin.right;
    const chartHeightInner = chartHeight - margin.top - margin.bottom;

    // 采样数据点（最多50个）
    const sampled = this.sampleDistribution(distribution, 50);
    if (sampled.length < 2) return;

    // 动态计算最大抽数
    const maxPulls = Math.max(100, ...sampled.map(d => d.pulls));

    // 映射到Canvas坐标
    const points = sampled.map(d => ({
      x: 40 + margin.left + (d.pulls / maxPulls) * chartWidth,
      y: startY + chartHeight - margin.bottom - (d.probability / 100) * chartHeightInner
    }));

    // 绘制填充区域
    ctx.fillStyle = 'rgba(212, 188, 153, 0.3)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, startY + chartHeight - margin.bottom);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, startY + chartHeight - margin.bottom);
    ctx.closePath();
    ctx.fill();

    // 绘制曲线
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  /**
   * 绘制底部品牌区域
   */
  drawFooter(planningData, config) {
    const ctx = this.ctx;
    const { gameName, version } = planningData;
    const startY = config.height - 80;

    // 分隔线
    ctx.strokeStyle = COLORS.gray200;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, startY);
    ctx.lineTo(config.width - 40, startY);
    ctx.stroke();

    // 品牌文字
    ctx.font = '20px sans-serif';
    ctx.fillStyle = COLORS.gray600;
    ctx.textAlign = 'center';
    ctx.fillText(`GachaPlaner · ${gameName} ${version || 'v1.0.0'}`, config.width / 2, startY + 40);
  }

  /**
   * 导出图片
   * @param {Object} canvas - Canvas对象
   * @returns {Promise<string>} 临时文件路径
   */
  exportImage(canvas) {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 保存图片到相册
   * @param {string} tempFilePath - 临时文件路径
   * @returns {Promise<Object>} Result对象
   */
  async saveToAlbum(tempFilePath) {
    try {
      // 请求保存权限
      const authResult = await this.requestSavePermission();
      if (!authResult.success) {
        return authResult;
      }

      // 保存图片
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: resolve,
          fail: reject
        });
      });

      return success(true);
    } catch (err) {
      return error(`保存图片失败：${err.errMsg || err.message}`);
    }
  }

  /**
   * 请求保存权限
   * @returns {Promise<Object>} Result对象
   */
  requestSavePermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.writePhotosAlbum']) {
            resolve(success(true));
          } else {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => resolve(success(true)),
              fail: () => {
                wx.showModal({
                  title: '权限提示',
                  content: '需要相册权限才能保存图片，请在设置中开启',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
                resolve(error('未授权相册权限'));
              }
            });
          }
        },
        fail: () => resolve(error('获取权限状态失败'))
      });
    });
  }

  /**
   * 获取概率对应颜色
   */
  getProbabilityColor(probability) {
    if (probability >= 80) return COLORS.success;
    if (probability >= 50) return COLORS.warning;
    return COLORS.danger;
  }

  /**
   * 绘制圆角矩形
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * 采样分布数据
   */
  sampleDistribution(distribution, maxPoints) {
    if (!distribution || distribution.length <= maxPoints) {
      return distribution || [];
    }

    const sorted = [...distribution].sort((a, b) => a.pulls - b.pulls);
    const result = [];
    for (let i = 0; i < maxPoints; i++) {
      const index = Math.round((i / (maxPoints - 1)) * (sorted.length - 1));
      result.push(sorted[index]);
    }
    return result;
  }
}

// 导出单例实例
const imageGenerator = new ImageGenerator();
module.exports = imageGenerator;
