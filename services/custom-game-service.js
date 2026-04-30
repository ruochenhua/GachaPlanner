/**
 * 自定义游戏服务
 * 提供自定义游戏模板的创建、验证、保存、加载功能
 */

const { success, error } = require('../utils/result');
const { validateConfig } = require('../core/config/config-validator');

// 存储键
const CUSTOM_GAMES_KEY = 'custom_games';

/**
 * 自定义游戏服务类
 */
class CustomGameService {
  constructor() {
    // 缓存自定义游戏列表
    this.cache = null;
  }

  /**
   * 生成模板ID
   * @returns {string} 模板ID
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `custom_${timestamp}_${random}`;
  }

  /**
   * 验证模板
   * @param {Object} template 模板数据
   * @returns {Object} 验证结果
   */
  validateTemplate(template) {
    const errors = [];

    // 验证游戏名称
    if (!template.name || typeof template.name !== 'string') {
      errors.push({
        field: 'name',
        message: '游戏名称必须为非空字符串'
      });
    } else if (template.name.length > 50) {
      errors.push({
        field: 'name',
        message: '游戏名称长度不能超过50字符'
      });
    }

    // 验证保底配置
    if (!template.pityConfig || typeof template.pityConfig !== 'object') {
      errors.push({
        field: 'pityConfig',
        message: '保底配置必须为对象'
      });
    } else {
      const pityErrors = this.validatePityConfig(template.pityConfig);
      errors.push(...pityErrors);
    }

    // 验证概率配置
    if (!template.probabilityConfig || typeof template.probabilityConfig !== 'object') {
      errors.push({
        field: 'probabilityConfig',
        message: '概率配置必须为对象'
      });
    } else {
      const probErrors = this.validateProbabilityConfig(template.probabilityConfig);
      errors.push(...probErrors);
    }

    // 验证资源配置
    if (!template.resourceConfig || typeof template.resourceConfig !== 'object') {
      errors.push({
        field: 'resourceConfig',
        message: '资源配置必须为对象'
      });
    } else {
      const resourceErrors = this.validateResourceConfig(template.resourceConfig);
      errors.push(...resourceErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证保底配置
   * @param {Object} pityConfig 保底配置
   * @returns {Array} 错误列表
   */
  validatePityConfig(pityConfig) {
    const errors = [];
    const validTypes = ['hard', 'soft', 'none'];

    if (!validTypes.includes(pityConfig.type)) {
      errors.push({
        field: 'pityConfig.type',
        message: `保底类型必须为 ${validTypes.join('/')} 之一`
      });
    }

    // 硬保底验证
    if (pityConfig.type === 'hard') {
      if (typeof pityConfig.hardPity !== 'number' || pityConfig.hardPity <= 0) {
        errors.push({
          field: 'pityConfig.hardPity',
          message: '硬保底阈值必须为大于0的数字'
        });
      }
    }

    // 软保底验证
    if (pityConfig.type === 'soft') {
      if (typeof pityConfig.softPityStart !== 'number' || pityConfig.softPityStart <= 0) {
        errors.push({
          field: 'pityConfig.softPityStart',
          message: '软保底起始抽数必须为大于0的数字'
        });
      }
      if (typeof pityConfig.softPityRate !== 'number' || pityConfig.softPityRate <= 0) {
        errors.push({
          field: 'pityConfig.softPityRate',
          message: '软保底概率提升率必须为大于0的数字'
        });
      }
    }

    return errors;
  }

  /**
   * 验证概率配置
   * @param {Object} probabilityConfig 概率配置
   * @returns {Array} 错误列表
   */
  validateProbabilityConfig(probabilityConfig) {
    const errors = [];

    if (typeof probabilityConfig.baseRate !== 'number') {
      errors.push({
        field: 'probabilityConfig.baseRate',
        message: '基础概率必须为数字'
      });
    } else if (probabilityConfig.baseRate <= 0 || probabilityConfig.baseRate > 1) {
      errors.push({
        field: 'probabilityConfig.baseRate',
        message: '基础概率必须在0-1之间'
      });
    }

    if (probabilityConfig.upMechanism && probabilityConfig.upRate !== undefined) {
      if (typeof probabilityConfig.upRate !== 'number' ||
          probabilityConfig.upRate <= 0 ||
          probabilityConfig.upRate > 1) {
        errors.push({
          field: 'probabilityConfig.upRate',
          message: 'UP概率必须在0-1之间'
        });
      }
    }

    return errors;
  }

  /**
   * 验证资源配置
   * @param {Object} resourceConfig 资源配置
   * @returns {Array} 错误列表
   */
  validateResourceConfig(resourceConfig) {
    const errors = [];

    if (!resourceConfig.primaryResource || typeof resourceConfig.primaryResource !== 'object') {
      errors.push({
        field: 'resourceConfig.primaryResource',
        message: '主要资源配置必须为对象'
      });
    } else {
      const primary = resourceConfig.primaryResource;
      if (!primary.id || !primary.name) {
        errors.push({
          field: 'resourceConfig.primaryResource',
          message: '主要资源必须包含id和name'
        });
      }
      if (typeof primary.convertRate !== 'number' || primary.convertRate <= 0) {
        errors.push({
          field: 'resourceConfig.primaryResource.convertRate',
          message: '资源转换率必须为大于0的数字'
        });
      }
    }

    return errors;
  }

  /**
   * 创建模板
   * @param {Object} templateData 模板数据
   * @returns {Object} Result对象
   */
  createTemplate(templateData) {
    // 验证模板
    const validation = this.validateTemplate(templateData);
    if (!validation.valid) {
      const errorMsg = validation.errors.map(e => e.message).join('; ');
      return error(`模板验证失败: ${errorMsg}`);
    }

    // 创建完整模板
    const template = {
      id: this.generateId(),
      name: templateData.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),

      pityConfig: {
        type: templateData.pityConfig.type,
        inheritance: templateData.pityConfig.inheritance !== false,
        ...(templateData.pityConfig.type === 'hard' && {
          hardPity: templateData.pityConfig.hardPity
        }),
        ...(templateData.pityConfig.type === 'soft' && {
          softPityStart: templateData.pityConfig.softPityStart,
          softPityRate: templateData.pityConfig.softPityRate
        })
      },

      probabilityConfig: {
        baseRate: templateData.probabilityConfig.baseRate,
        upMechanism: templateData.probabilityConfig.upMechanism || false,
        ...(templateData.probabilityConfig.upRate && {
          upRate: templateData.probabilityConfig.upRate
        })
      },

      resourceConfig: {
        primaryResource: templateData.resourceConfig.primaryResource,
        ...(templateData.resourceConfig.secondaryResource && {
          secondaryResource: templateData.resourceConfig.secondaryResource
        })
      },

      isActive: true,
      isValidated: true
    };

    return success(template);
  }

  /**
   * 保存模板
   * @param {Object} template 模板数据
   * @returns {Object} Result对象
   */
  saveTemplate(template) {
    try {
      // 加载现有模板列表
      const templates = this.loadTemplatesRaw();

      // 检查是否已存在（更新）
      const existingIndex = templates.findIndex(t => t.id === template.id);
      if (existingIndex !== -1) {
        template.updatedAt = Date.now();
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }

      // 保存到存储
      wx.setStorageSync(CUSTOM_GAMES_KEY, templates);
      this.cache = templates;

      console.log(`✓ 自定义游戏模板已保存: ${template.id}`);
      return success(template);
    } catch (err) {
      console.error('保存模板失败:', err);
      return error(`保存模板失败: ${err.message}`);
    }
  }

  /**
   * 加载模板列表（原始数据）
   * @returns {Array} 模板列表
   */
  loadTemplatesRaw() {
    try {
      if (this.cache !== null) {
        return this.cache;
      }

      const templates = wx.getStorageSync(CUSTOM_GAMES_KEY) || [];
      this.cache = templates;
      return templates;
    } catch (err) {
      console.error('加载模板列表失败:', err);
      return [];
    }
  }

  /**
   * 加载模板列表（仅启用的）
   * @returns {Object} Result对象
   */
  loadTemplates() {
    try {
      const templates = this.loadTemplatesRaw();
      const activeTemplates = templates.filter(t => t.isActive);
      return success(activeTemplates);
    } catch (err) {
      return error(`加载模板列表失败: ${err.message}`);
    }
  }

  /**
   * 获取单个模板
   * @param {string} id 模板ID
   * @returns {Object} Result对象
   */
  getTemplate(id) {
    const templates = this.loadTemplatesRaw();
    const template = templates.find(t => t.id === id);

    if (!template) {
      return error(`模板不存在: ${id}`);
    }

    return success(template);
  }

  /**
   * 更新模板
   * @param {string} id 模板ID
   * @param {Object} updates 更新内容
   * @returns {Object} Result对象
   */
  updateTemplate(id, updates) {
    try {
      const templates = this.loadTemplatesRaw();
      const index = templates.findIndex(t => t.id === id);

      if (index === -1) {
        return error(`模板不存在: ${id}`);
      }

      const updatedTemplate = {
        ...templates[index],
        ...updates,
        updatedAt: Date.now()
      };

      // 验证更新后的模板
      const validation = this.validateTemplate(updatedTemplate);
      if (!validation.valid) {
        const errorMsg = validation.errors.map(e => e.message).join('; ');
        return error(`模板验证失败: ${errorMsg}`);
      }

      templates[index] = updatedTemplate;
      wx.setStorageSync(CUSTOM_GAMES_KEY, templates);
      this.cache = templates;

      console.log(`✓ 模板已更新: ${id}`);
      return success(updatedTemplate);
    } catch (err) {
      return error(`更新模板失败: ${err.message}`);
    }
  }

  /**
   * 删除模板
   * @param {string} id 模板ID
   * @returns {Object} Result对象
   */
  deleteTemplate(id) {
    try {
      const templates = this.loadTemplatesRaw();
      const index = templates.findIndex(t => t.id === id);

      if (index === -1) {
        return error(`模板不存在: ${id}`);
      }

      templates.splice(index, 1);
      wx.setStorageSync(CUSTOM_GAMES_KEY, templates);
      this.cache = templates;

      console.log(`✓ 模板已删除: ${id}`);
      return success(true);
    } catch (err) {
      return error(`删除模板失败: ${err.message}`);
    }
  }

  /**
   * 切换模板启用状态
   * @param {string} id 模板ID
   * @returns {Object} Result对象
   */
  toggleTemplateActive(id) {
    const templates = this.loadTemplatesRaw();
    const template = templates.find(t => t.id === id);

    if (!template) {
      return error(`模板不存在: ${id}`);
    }

    return this.updateTemplate(id, { isActive: !template.isActive });
  }

  /**
   * 将模板转换为游戏配置格式
   * @param {Object} template 模板数据
   * @returns {Object} 游戏配置
   */
  templateToGameConfig(template) {
    const config = {
      gameId: template.id,
      name: template.name,
      version: '1.0.0',
      updatedAt: new Date(template.updatedAt || template.createdAt).toISOString().split('T')[0],

      pityType: template.pityConfig.type,
      baseRate: template.probabilityConfig.baseRate,

      resources: {
        [template.resourceConfig.primaryResource.id]: {
          name: template.resourceConfig.primaryResource.name,
          icon: '/assets/images/custom-game.png'
        }
      },

      conversionRate: {
        [`${template.resourceConfig.primaryResource.id}ToPull`]: template.resourceConfig.primaryResource.convertRate
      }
    };

    // 添加保底参数
    if (template.pityConfig.type === 'hard') {
      config.hardPity = template.pityConfig.hardPity;
    } else if (template.pityConfig.type === 'soft') {
      config.softPityStart = template.pityConfig.softPityStart;
      config.softPityIncrement = template.pityConfig.softPityRate;
    }

    // 添加UP机制
    if (template.probabilityConfig.upMechanism && template.probabilityConfig.upRate) {
      config.characterProbalityUp = template.probabilityConfig.upRate;
    }

    return config;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache = null;
  }
}

// 导出单例实例
const customGameService = new CustomGameService();
module.exports = customGameService;