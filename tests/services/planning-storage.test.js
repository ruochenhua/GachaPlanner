/**
 * PlanningStorage 单元测试
 */

const PlanningStorage = require('../../services/planning-storage');

// Mock wx API
const mockStorage = {};

global.wx = {
  setStorageSync: jest.fn((key, value) => {
    mockStorage[key] = value;
  }),
  getStorageSync: jest.fn((key) => {
    return mockStorage[key] || null;
  }),
  removeStorageSync: jest.fn((key) => {
    delete mockStorage[key];
  }),
  getStorageInfoSync: jest.fn(() => {
    return { keys: Object.keys(mockStorage) };
  })
};

describe('PlanningStorage - 规划数据持久化服务', () => {
  beforeEach(() => {
    // 清空 mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStorageKey - 生成存储键', () => {
    test('应生成正确的存储键', () => {
      const key = PlanningStorage.getStorageKey('genshin');
      expect(key).toBe('gacha_planning_genshin');
    });

    test('不同游戏 ID 应生成不同键', () => {
      const key1 = PlanningStorage.getStorageKey('genshin');
      const key2 = PlanningStorage.getStorageKey('starrail');
      expect(key1).not.toBe(key2);
    });
  });

  describe('savePlanningData - 保存数据', () => {
    const testData = {
      resources: {
        primogems: 1000,
        intertwinedFates: 10,
        currentPity: 50
      },
      totalPulls: 50,
      dailyIncome: {
        primogems: 60,
        commissions: true
      }
    };

    test('应成功保存数据', async () => {
      const result = await PlanningStorage.savePlanningData('genshin', testData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(wx.setStorageSync).toHaveBeenCalledTimes(1);
    });

    test('保存的数据应包含版本号', async () => {
      const result = await PlanningStorage.savePlanningData('genshin', testData);

      expect(result.data.version).toBe('2.0.0');
    });

    test('保存的数据应包含元数据', async () => {
      const result = await PlanningStorage.savePlanningData('genshin', testData);

      expect(result.data.metadata).toBeDefined();
      expect(result.data.metadata.gameId).toBe('genshin');
      expect(result.data.metadata.lastSavedAt).toBeDefined();
    });

    test('保存失败应返回错误', async () => {
      wx.setStorageSync.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      const result = await PlanningStorage.savePlanningData('genshin', testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('loadPlanningData - 加载数据', () => {
    test('无保存数据时应返回默认数据', async () => {
      const result = await PlanningStorage.loadPlanningData('genshin');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.resources).toBeDefined();
      expect(result.data.version).toBe('2.0.0');
    });

    test('应加载已保存的数据', async () => {
      const testData = {
        resources: { primogems: 2000, intertwinedFates: 20, currentPity: 70 },
        version: '1.0.0'
      };
      mockStorage['gacha_planning_genshin'] = JSON.stringify(testData);

      const result = await PlanningStorage.loadPlanningData('genshin');

      expect(result.success).toBe(true);
      expect(result.data.resources.primogems).toBe(2000);
      expect(result.data.resources.currentPity).toBe(70);
    });

    test('字符串数据应自动解析', async () => {
      const testData = {
        resources: { primogems: 500, intertwinedFates: 5, currentPity: 30 },
        version: '1.0.0'
      };
      mockStorage['gacha_planning_genshin'] = JSON.stringify(testData);

      const result = await PlanningStorage.loadPlanningData('genshin');

      expect(result.success).toBe(true);
      expect(result.data.resources.primogems).toBe(500);
    });

    test('对象数据应直接返回', async () => {
      const testData = {
        resources: { primogems: 800, intertwinedFates: 8, currentPity: 40 },
        version: '1.0.0'
      };
      mockStorage['gacha_planning_genshin'] = testData;

      const result = await PlanningStorage.loadPlanningData('genshin');

      expect(result.success).toBe(true);
      expect(result.data.resources.primogems).toBe(800);
    });

    test('加载失败应返回默认数据', async () => {
      wx.getStorageSync.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = await PlanningStorage.loadPlanningData('genshin');

      expect(result.success).toBe(false);
      expect(result.data).toBeDefined();
      expect(result.data.version).toBe('2.0.0');
    });
  });

  describe('deletePlanningData - 删除数据', () => {
    test('应成功删除数据', async () => {
      mockStorage['gacha_planning_genshin'] = JSON.stringify({ resources: {} });

      const result = await PlanningStorage.deletePlanningData('genshin');

      expect(result.success).toBe(true);
      expect(wx.removeStorageSync).toHaveBeenCalledTimes(1);
      expect(mockStorage['gacha_planning_genshin']).toBeUndefined();
    });

    test('删除不存在的数据应成功', async () => {
      const result = await PlanningStorage.deletePlanningData('non-existent');

      expect(result.success).toBe(true);
    });

    test('删除失败应返回错误', async () => {
      wx.removeStorageSync.mockImplementationOnce(() => {
        throw new Error('Delete failed');
      });

      const result = await PlanningStorage.deletePlanningData('genshin');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getAllGameIds - 获取所有游戏 ID', () => {
    test('应返回所有已保存的游戏 ID', async () => {
      mockStorage['gacha_planning_genshin'] = '{}';
      mockStorage['gacha_planning_starrail'] = '{}';
      mockStorage['gacha_planning_hok'] = '{}';
      mockStorage['other_key'] = '{}';

      const result = await PlanningStorage.getAllGameIds();

      expect(result.success).toBe(true);
      expect(result.data).toContain('genshin');
      expect(result.data).toContain('starrail');
      expect(result.data).toContain('hok');
      expect(result.data).not.toContain('other_key');
    });

    test('无保存数据时应返回空数组', async () => {
      const result = await PlanningStorage.getAllGameIds();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getAllPlanningData - 获取所有规划数据', () => {
    test('应返回所有游戏的规划数据', async () => {
      mockStorage['gacha_planning_genshin'] = JSON.stringify({
        version: '1.0.0',
        resources: { primogems: 1000 }
      });
      mockStorage['gacha_planning_starrail'] = JSON.stringify({
        version: '1.0.0',
        resources: { primogems: 500 }
      });

      const result = await PlanningStorage.getAllPlanningData();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });
  });

  describe('clearAllData - 清空所有数据', () => {
    test('应清空所有规划数据', async () => {
      mockStorage['gacha_planning_genshin'] = '{}';
      mockStorage['gacha_planning_starrail'] = '{}';

      const result = await PlanningStorage.clearAllData();

      expect(result.success).toBe(true);
      expect(result.data.clearedCount).toBe(2);
      expect(Object.keys(mockStorage).length).toBe(0);
    });
  });

  describe('migrateData - 数据迁移', () => {
    test('应迁移旧版本数据到 1.0.0', () => {
      const oldData = {
        version: '0.9.0',
        resources: {
          primogems: 1500,
          intertwinedFates: 15
        },
        dailyIncome: {
          primogems: 50
        }
      };

      const result = PlanningStorage.migrateData(oldData, 'genshin');

      expect(result.success).toBe(true);
      expect(result.data.version).toBe('2.0.0');
      expect(result.data.resources.primogems).toBe(1500);
      expect(result.data.resources.intertwinedFates).toBe(15);
      expect(result.data.resources.currentPity).toBe(0); // 默认值
      expect(result.data.dailyIncome.primogems).toBe(50);
    });

    test('应迁移无版本数据', () => {
      const oldData = {
        resources: { primogems: 2000 }
      };

      const result = PlanningStorage.migrateData(oldData, 'starrail');

      expect(result.success).toBe(true);
      expect(result.data.version).toBe('2.0.0');
      expect(result.data.resources.primogems).toBe(2000);
    });
  });

  describe('validateData - 数据验证', () => {
    test('有效数据应通过验证', () => {
      const validData = {
        resources: {
          primogems: 1000,
          currentPity: 50
        },
        dailyIncome: {
          primogems: 60
        },
        targets: []
      };

      const result = PlanningStorage.validateData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('缺少 resources 应验证失败', () => {
      const invalidData = { dailyIncome: {} };

      const result = PlanningStorage.validateData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少 resources 字段');
    });

    test('primogems 不是数字应验证失败', () => {
      const invalidData = {
        resources: {
          primogems: 'not a number',
          currentPity: 50
        }
      };

      const result = PlanningStorage.validateData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('primogems 必须是数字');
    });

    test('currentPity 不是数字应验证失败', () => {
      const invalidData = {
        resources: {
          primogems: 1000,
          currentPity: 'fifty'
        }
      };

      const result = PlanningStorage.validateData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('currentPity 必须是数字');
    });

    test('targets 不是数组应验证失败', () => {
      const invalidData = {
        resources: { primogems: 1000, currentPity: 0 },
        targets: 'not an array'
      };

      const result = PlanningStorage.validateData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('targets 必须是数组');
    });
  });

  describe('集成测试', () => {
    test('完整流程：保存 -> 加载 -> 删除', async () => {
      const testData = {
        resources: {
          primogems: 3000,
          intertwinedFates: 30,
          currentPity: 80
        },
        totalPulls: 80,
        dailyIncome: {
          primogems: 60,
          commissions: true
        },
        targets: [{ id: '1', name: 'Test Target' }]
      };

      // 保存
      const saveResult = await PlanningStorage.savePlanningData('test-game', testData);
      expect(saveResult.success).toBe(true);

      // 加载
      const loadResult = await PlanningStorage.loadPlanningData('test-game');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data.resources.primogems).toBe(3000);
      expect(loadResult.data.targets.length).toBe(1);

      // 删除
      const deleteResult = await PlanningStorage.deletePlanningData('test-game');
      expect(deleteResult.success).toBe(true);

      // 再次加载应返回默认数据
      const loadAfterDelete = await PlanningStorage.loadPlanningData('test-game');
      expect(loadAfterDelete.success).toBe(true);
      expect(loadAfterDelete.data.resources.primogems).toBe(0);
    });

    test('多游戏数据隔离', async () => {
      await PlanningStorage.savePlanningData('genshin', {
        resources: { primogems: 1000, currentPity: 50 }
      });
      await PlanningStorage.savePlanningData('starrail', {
        resources: { primogems: 2000, currentPity: 70 }
      });

      const genshinData = await PlanningStorage.loadPlanningData('genshin');
      const starrailData = await PlanningStorage.loadPlanningData('starrail');

      expect(genshinData.data.resources.primogems).toBe(1000);
      expect(starrailData.data.resources.primogems).toBe(2000);
    });
  });
});
