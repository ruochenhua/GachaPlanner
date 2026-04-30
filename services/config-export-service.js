/**
 * 配置导出导入服务
 * 提供配置的导出、导入、分享功能
 */

const { exportConfig, importConfig, validateEnhancedConfig } = require('../config/config-template-enhanced');
const storageService = require('./storage-service');
const { success, error } = require('../utils/result');

/**
 * 导出当前游戏配置
 * @param {string} gameId - 游戏ID
 * @returns {Object} Result {success, data, error}
 */
function exportGameConfig(gameId) {
  try {
    // 加载游戏配置（含用户自定义参数）
    const configResult = storageService.loadCustomRuleSettings(gameId);
    if (!configResult.success) {
      return error('加载配置失败');
    }

    // 合并配置
    const baseConfig = require(`../config/games/${gameId}`);
    let config = baseConfig;

    if (configResult.data && configResult.data.isCustom) {
      config = {
        ...baseConfig,
        ...configResult.data,
        _isCustom: true
      };
    }

    // 导出为JSON
    const jsonStr = exportConfig(config);

    return success({
      json: jsonStr,
      config: config,
      filename: `${gameId}-config-${Date.now()}.json`
    });
  } catch (err) {
    console.error('导出配置失败:', err);
    return error(`导出失败: ${err.message}`);
  }
}

/**
 * 导入游戏配置
 * @param {string} jsonStr - JSON字符串
 * @returns {Object} Result {success, data, error}
 */
function importGameConfig(jsonStr) {
  try {
    // 解析和验证配置
    const importResult = importConfig(jsonStr);
    if (!importResult.success) {
      return error(importResult.error);
    }

    const config = importResult.config;

    // 保存到本地存储
    const saveResult = storageService.saveCustomRuleSettings(config.gameId, {
      baseRate: config.baseRate,
      hardPity: config.hardPity?.count || config.hardPity,
      softPityStart: config.softPity?.start || config.softPityStart,
      softPityIncrement: config.softPity?.increment || config.softPityIncrement,
      isCustom: true
    });

    if (!saveResult.success) {
      return error('保存配置失败');
    }

    return success({
      gameId: config.gameId,
      name: config.name,
      config: config
    });
  } catch (err) {
    console.error('导入配置失败:', err);
    return error(`导入失败: ${err.message}`);
  }
}

/**
 * 分享配置到剪贴板
 * @param {string} gameId - 游戏ID
 * @returns {Object} Result {success, error}
 */
function shareConfigToClipboard(gameId) {
  const exportResult = exportGameConfig(gameId);
  if (!exportResult.success) {
    return exportResult;
  }

  try {
    wx.setClipboardData({
      data: exportResult.data.json,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });

    return success();
  } catch (err) {
    return error('复制失败');
  }
}

/**
 * 从剪贴板导入配置
 * @returns {Object} Result {success, data, error}
 */
function importConfigFromClipboard() {
  return new Promise((resolve) => {
    wx.getClipboardData({
      success: (res) => {
        const importResult = importGameConfig(res.data);
        resolve(importResult);
      },
      fail: () => {
        resolve(error('读取剪贴板失败'));
      }
    });
  });
}

/**
 * 保存配置到文件
 * @param {string} gameId - 游戏ID
 * @returns {Object} Result {success, error}
 */
function saveConfigToFile(gameId) {
  const exportResult = exportGameConfig(gameId);
  if (!exportResult.success) {
    return exportResult;
  }

  try {
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/${exportResult.data.filename}`;

    fs.writeFile({
      filePath: filePath,
      data: exportResult.data.json,
      encoding: 'utf8',
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        // 分享文件
        wx.shareFileMessage({
          filePath: filePath,
          success: () => {
            console.log('分享成功');
          }
        });
      },
      fail: (err) => {
        console.error('保存文件失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });

    return success({ filePath });
  } catch (err) {
    return error('保存文件失败');
  }
}

/**
 * 验证配置兼容性
 * @param {Object} config - 配置对象
 * @returns {Object} {compatible, warnings, suggestions}
 */
function checkConfigCompatibility(config) {
  const warnings = [];
  const suggestions = [];

  // 检查版本
  if (config.version && config.version.startsWith('1.')) {
    warnings.push('配置版本较旧，建议升级到 2.0');
    suggestions.push('使用配置模板重新生成配置');
  }

  // 检查保底类型
  if (config.pityType === 'guarantee' && !config.guarantee?.enabled) {
    warnings.push('保底类型为 guarantee 但未启用大小保底');
    suggestions.push('设置 guarantee.enabled = true');
  }

  // 检查资源定义
  if (!config.resources?.secondary) {
    warnings.push('缺少次要资源定义');
    suggestions.push('添加次要资源（如纠缠之缘）');
  }

  // 检查捕获明光机制
  if (config.guarantee?.captureLight && config.gameId !== 'genshin') {
    warnings.push('捕获明光机制仅适用于原神');
  }

  return {
    compatible: warnings.length === 0,
    warnings,
    suggestions
  };
}

module.exports = {
  exportGameConfig,
  importGameConfig,
  shareConfigToClipboard,
  importConfigFromClipboard,
  saveConfigToFile,
  checkConfigCompatibility
};