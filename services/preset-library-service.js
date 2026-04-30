/**
 * 预设模板库服务
 * 提供预设模板的浏览、导入、导出功能
 */

const presetLibrary = require('../config/games/presets/preset-library.js');
const { PRESET_LIBRARY } = presetLibrary;
const { validateEnhancedConfig, exportConfig, importConfig } = require('../config/config-template-enhanced.js');

/**
 * 预设模板库服务类
 */
class PresetLibraryService {
  /**
   * 获取预设模板列表
   * @param {Object} options - 查询选项
   * @param {string} options.category - 按分类筛选
   * @param {string} options.tag - 按标签筛选
   * @param {string} options.keyword - 关键词搜索
   * @returns {Array} 预设模板列表
   */
  static getLibraryList(options = {}) {
    const { category, tag, keyword } = options;
    let results = PRESET_LIBRARY;

    // 按分类筛选
    if (category) {
      results = results.filter(preset => preset.category === category);
    }

    // 按标签筛选
    if (tag) {
      results = results.filter(preset => preset.tags.includes(tag));
    }

    // 关键词搜索（匹配名称或标签）
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(preset =>
        preset.name.toLowerCase().includes(lowerKeyword) ||
        preset.tags.some(t => t.toLowerCase().includes(lowerKeyword))
      );
    }

    return results.map(preset => ({
      id: preset.id,
      name: preset.name,
      category: preset.category,
      tags: preset.tags
    }));
  }

  /**
   * 获取预设模板详情
   * @param {string} presetId - 预设 ID
   * @returns {Object} 预设详情
   */
  static getPresetById(presetId) {
    const preset = PRESET_LIBRARY.find(p => p.id === presetId);
    if (!preset) {
      return { success: false, error: '未找到该预设模板' };
    }
    return { success: true, data: preset.config };
  }

  /**
   * 导入预设模板
   * @param {string} presetId - 预设 ID
   * @returns {Object} 导入结果
   */
  static importPreset(presetId) {
    const preset = PRESET_LIBRARY.find(p => p.id === presetId);
    if (!preset) {
      return { success: false, error: '未找到该预设模板' };
    }

    // 验证配置完整性
    const validation = validateEnhancedConfig(preset.config);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    return {
      success: true,
      data: preset.config,
      message: `已成功导入 ${preset.name} 配置模板`
    };
  }

  /**
   * 导出配置为 JSON 字符串
   * @param {Object} config - 游戏配置
   * @returns {Object} 导出结果
   */
  static exportConfig(config) {
    try {
      // 验证配置
      const validation = validateEnhancedConfig(config);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join('; ') };
      }

      const jsonStr = exportConfig(config);
      return { success: true, data: jsonStr };
    } catch (err) {
      return { success: false, error: `导出失败：${err.message}` };
    }
  }

  /**
   * 从 JSON 字符串导入配置
   * @param {string} jsonStr - JSON 字符串
   * @returns {Object} 导入结果
   */
  static importConfig(jsonStr) {
    try {
      const result = importConfig(jsonStr);
      if (result.success) {
        return { success: true, data: result.config };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: `导入失败：${err.message}` };
    }
  }

  /**
   * 获取所有分类列表
   * @returns {Array} 分类列表
   */
  static getCategories() {
    const categories = new Set(PRESET_LIBRARY.map(preset => preset.category));
    return Array.from(categories);
  }

  /**
   * 获取所有标签列表
   * @returns {Array} 标签列表
   */
  static getAllTags() {
    const tags = new Set();
    PRESET_LIBRARY.forEach(preset => {
      preset.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  /**
   * 获取分类统计信息
   * @returns {Object} 分类统计
   */
  static getCategoryStats() {
    const stats = {};
    PRESET_LIBRARY.forEach(preset => {
      const category = preset.category;
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }

  /**
   * 验证配置与预设模板的差异
   * @param {Object} config - 待验证配置
   * @param {string} presetId - 预设模板 ID
   * @returns {Object} 差异对比结果
   */
  static compareWithPreset(config, presetId) {
    const preset = PRESET_LIBRARY.find(p => p.id === presetId);
    if (!preset) {
      return { success: false, error: '未找到该预设模板' };
    }

    const differences = [];
    const baseConfig = preset.config;

    // 比较关键字段
    const fieldsToCompare = [
      'pityType', 'baseRate', 'hardPity', 'softPity',
      'guarantee', 'luckValue', 'multiPool'
    ];

    fieldsToCompare.forEach(field => {
      if (JSON.stringify(config[field]) !== JSON.stringify(baseConfig[field])) {
        differences.push({
          field,
          currentValue: config[field],
          presetValue: baseConfig[field]
        });
      }
    });

    return {
      success: true,
      data: {
        presetId,
        presetName: preset.name,
        differences,
        isIdentical: differences.length === 0
      }
    };
  }
}

module.exports = PresetLibraryService;
