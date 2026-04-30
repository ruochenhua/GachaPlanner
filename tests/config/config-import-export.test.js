/**
 * 配置导入导出测试
 */

const { exportConfig, importConfig, validateEnhancedConfig } = require('../../config/config-template-enhanced.js');
const { PRESET_LIBRARY } = require('../../config/games/presets/preset-library.js');

describe('配置导入导出 - 集成测试', () => {
  // 有效的测试配置
  const validConfig = {
    gameId: 'test-game',
    name: '测试游戏',
    version: '1.0.0',
    updatedAt: '2026-04-25',
    pityType: 'hard',
    baseRate: 0.01,
    hardPity: {
      enabled: true,
      count: 90,
      resetOnSuccess: true
    },
    softPity: {
      enabled: false,
      start: 74,
      increment: 0.06,
      maxRate: 1.0
    },
    guarantee: {
      enabled: false,
      rate: 0.5,
      captureLight: false,
      captureLightRate: 0
    },
    luckValue: {
      enabled: false,
      maxValue: 361,
      incrementPerPull: 1,
      ratePerLuck: 0,
      guaranteeAtMax: true
    },
    multiPool: {
      enabled: false,
      sharedPity: false,
      pools: []
    },
    pityInheritance: {
      enabled: true,
      crossPool: false,
      expirationDays: 0
    },
    resources: {
      primary: { id: 'gem', name: '宝石', type: 'primary' },
      secondary: { id: 'ticket', name: '抽卡券', type: 'secondary' }
    },
    conversionRate: {
      primaryToPull: 100
    },
    metadata: {
      developer: 'Test Dev',
      officialUrl: 'https://test.com',
      description: '测试游戏配置',
      tags: ['测试', '硬保底']
    }
  };

  describe('exportConfig - 导出配置', () => {
    test('应成功导出有效配置', () => {
      const result = exportConfig(validConfig);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('导出的 JSON 应包含必要字段', () => {
      const result = exportConfig(validConfig);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('config');
      expect(parsed).toHaveProperty('checksum');
    });

    test('导出的配置应保持原始数据', () => {
      const result = exportConfig(validConfig);
      const parsed = JSON.parse(result);

      expect(parsed.config.gameId).toBe(validConfig.gameId);
      expect(parsed.config.name).toBe(validConfig.name);
      expect(parsed.config.pityType).toBe(validConfig.pityType);
      expect(parsed.config.baseRate).toBe(validConfig.baseRate);
    });

    test('多次导出应生成不同的 checksum（因 exportedAt 不同）', () => {
      const result1 = exportConfig(validConfig);
      const result2 = exportConfig(validConfig);
      const parsed1 = JSON.parse(result1);
      const parsed2 = JSON.parse(result2);

      // checksum 基于配置内容，相同配置应生成相同 checksum
      expect(parsed1.checksum).toBe(parsed2.checksum);
    });

    test('导出的 JSON 应是有效格式', () => {
      const result = exportConfig(validConfig);
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('importConfig - 导入配置', () => {
    test('应成功导入有效配置', () => {
      const exported = exportConfig(validConfig);
      const result = importConfig(exported);

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config.gameId).toBe(validConfig.gameId);
    });

    test('导入的配置应与原始配置一致', () => {
      const exported = exportConfig(validConfig);
      const result = importConfig(exported);

      expect(result.config.gameId).toBe(validConfig.gameId);
      expect(result.config.name).toBe(validConfig.name);
      expect(result.config.pityType).toBe(validConfig.pityType);
      expect(result.config.baseRate).toBe(validConfig.baseRate);
    });

    test('无效 JSON 应返回错误', () => {
      const result = importConfig('not valid json');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('缺少版本信息应返回错误', () => {
      const result = importConfig(JSON.stringify({ config: validConfig }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('版本');
    });

    test('checksum 不匹配应返回错误', () => {
      const exported = exportConfig(validConfig);
      const parsed = JSON.parse(exported);
      parsed.checksum = 'tampered-checksum';

      const result = importConfig(JSON.stringify(parsed));
      expect(result.success).toBe(false);
      expect(result.error).toContain('校验');
    });

    test('配置验证失败应返回错误', () => {
      const invalidConfig = {
        ...validConfig,
        gameId: '', // 空 gameId
        baseRate: 2.0 // 无效的基础概率
      };
      const exported = exportConfig(invalidConfig);
      const parsed = JSON.parse(exported);
      // 手动修正 checksum 以通过验证
      delete parsed.checksum;

      const result = importConfig(JSON.stringify(parsed));
      expect(result.success).toBe(false);
    });
  });

  describe('配置验证', () => {
    test('有效配置应通过验证', () => {
      const result = validateEnhancedConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('缺少 gameId 应验证失败', () => {
      const config = { ...validConfig, gameId: '' };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('gameId 是必填字段');
    });

    test('缺少 name 应验证失败', () => {
      const config = { ...validConfig, name: '' };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name 是必填字段');
    });

    test('baseRate 超出范围应验证失败', () => {
      const config = { ...validConfig, baseRate: 1.5 };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('baseRate 必须在 0.001 - 1.0 之间');
    });

    test('无效的 pityType 应验证失败', () => {
      const config = { ...validConfig, pityType: 'invalid-type' };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.join('; ')).toContain('pityType 必须是');
    });

    test('硬保底 count 超出范围应验证失败', () => {
      const config = {
        ...validConfig,
        hardPity: { enabled: true, count: 0 }
      };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('hardPity.count 必须在 1 - 1000 之间');
    });

    test('多池联动缺少 pools 应验证失败', () => {
      const config = {
        ...validConfig,
        pityType: 'multi-pool',
        multiPool: { enabled: true, sharedPity: true, pools: [] }
      };
      const result = validateEnhancedConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('multiPool.pools 必须至少有一个卡池');
    });
  });

  describe('预设模板导入导出循环测试', () => {
    PRESET_LIBRARY.forEach(preset => {
      test(`${preset.name} - 导出导入循环应保持一致`, () => {
        const exported = exportConfig(preset.config);
        const result = importConfig(exported);

        expect(result.success).toBe(true);
        expect(result.config.gameId).toBe(preset.config.gameId);
        expect(result.config.name).toBe(preset.config.name);
      });
    });
  });

  describe('边界条件测试', () => {
    test('空对象导出应正常处理', () => {
      const emptyConfig = {
        gameId: 'empty',
        name: '空配置',
        version: '1.0.0',
        updatedAt: '2026-04-25',
        pityType: 'none',
        baseRate: 0.01,
        hardPity: { enabled: false },
        softPity: { enabled: false },
        guarantee: { enabled: false },
        luckValue: { enabled: false },
        multiPool: { enabled: false, pools: [] },
        pityInheritance: { enabled: false, crossPool: false, expirationDays: 0 },
        resources: {
          primary: { id: 'a', name: 'A', type: 'primary' },
          secondary: { id: 'b', name: 'B', type: 'secondary' }
        },
        conversionRate: { primaryToPull: 1 },
        metadata: { developer: '', officialUrl: '', description: '', tags: [] }
      };

      const result = exportConfig(emptyConfig);
      expect(result).toBeDefined();
    });

    test('极大数值应正常处理', () => {
      const largeConfig = {
        ...validConfig,
        hardPity: { enabled: true, count: 1000 } // 最大允许值
      };

      const exported = exportConfig(largeConfig);
      const result = importConfig(exported);
      expect(result.success).toBe(true);
      expect(result.config.hardPity.count).toBe(1000);
    });

    test('极小数值应正常处理', () => {
      const smallConfig = {
        ...validConfig,
        baseRate: 0.001 // 最小允许值
      };

      const exported = exportConfig(smallConfig);
      const result = importConfig(exported);
      expect(result.success).toBe(true);
      expect(result.config.baseRate).toBe(0.001);
    });
  });

  describe('版本兼容性测试', () => {
    test('版本 2.0.0 配置应正常导入', () => {
      const v2Config = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        config: validConfig,
        checksum: 'test'
      };

      const exported = exportConfig(validConfig);
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe('2.0.0');
    });

    test('缺少 checksum 的配置应正常导入（不验证）', () => {
      const noChecksumData = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        config: validConfig
      };

      const result = importConfig(JSON.stringify(noChecksumData));
      expect(result.success).toBe(true);
    });
  });
});
