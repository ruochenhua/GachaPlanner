/**
 * PlanningStorage 集成测试
 */

const PlanningStorage = require('../../services/planning-storage');

// Mock wx API for integration tests
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

describe('PlanningStorage - 集成测试', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe('规划数据完整流程', () => {
    test('完整流程：保存 -> 加载 -> 修改 -> 再保存 -> 加载', async () => {
      const gameId = 'genshin';
      const initialData = {
        resources: {
          primogems: 1000,
          intertwinedFates: 10,
          currentPity: 50
        },
        poolTimeRange: {
          startDate: '2026-04-25',
          endDate: '2026-05-09'
        },
        dailyIncome: {
          primogems: 60,
          events: 100
        },
        targets: [{ id: '1', name: '抽取宵宫' }]
      };

      // 第一次保存
      const saveResult1 = await PlanningStorage.savePlanningData(gameId, initialData);
      expect(saveResult1.success).toBe(true);

      // 第一次加载
      const loadResult1 = await PlanningStorage.loadPlanningData(gameId);
      expect(loadResult1.success).toBe(true);
      expect(loadResult1.data.resources.primogems).toBe(1000);
      expect(loadResult1.data.poolTimeRange.startDate).toBe('2026-04-25');

      // 修改数据
      const modifiedData = {
        ...initialData,
        resources: {
          ...initialData.resources,
          primogems: 2000,
          currentPity: 70
        }
      };

      // 第二次保存
      const saveResult2 = await PlanningStorage.savePlanningData(gameId, modifiedData);
      expect(saveResult2.success).toBe(true);

      // 第二次加载 - 验证数据已更新
      const loadResult2 = await PlanningStorage.loadPlanningData(gameId);
      expect(loadResult2.success).toBe(true);
      expect(loadResult2.data.resources.primogems).toBe(2000);
      expect(loadResult2.data.resources.currentPity).toBe(70);
    });

    test('多游戏数据隔离', async () => {
      const games = [
        {
          gameId: 'genshin',
          data: { resources: { primogems: 1000, currentPity: 50 } }
        },
        {
          gameId: 'starrail',
          data: { resources: { primogems: 2000, currentPity: 70 } }
        },
        {
          gameId: 'hok',
          data: { resources: { primogems: 500, currentPity: 100 } }
        }
      ];

      // 保存多个游戏数据
      for (const game of games) {
        const result = await PlanningStorage.savePlanningData(game.gameId, game.data);
        expect(result.success).toBe(true);
      }

      // 验证每个游戏数据独立
      for (const game of games) {
        const result = await PlanningStorage.loadPlanningData(game.gameId);
        expect(result.success).toBe(true);
        expect(result.data.resources.primogems).toBe(game.data.resources.primogems);
        expect(result.data.resources.currentPity).toBe(game.data.resources.currentPity);
      }

      // 删除一个游戏数据
      const deleteResult = await PlanningStorage.deletePlanningData('starrail');
      expect(deleteResult.success).toBe(true);

      // 验证其他游戏数据不受影响
      const genshinResult = await PlanningStorage.loadPlanningData('genshin');
      const hokResult = await PlanningStorage.loadPlanningData('hok');
      const starrailResult = await PlanningStorage.loadPlanningData('starrail');

      expect(genshinResult.data.resources.primogems).toBe(1000);
      expect(hokResult.data.resources.primogems).toBe(500);
      expect(starrailResult.data.resources.primogems).toBe(0); // 默认值
    });
  });

  describe('数据版本迁移', () => {
    test('应自动迁移 v0.9.0 数据到 v1.0.0', async () => {
      const oldVersionData = {
        version: '0.9.0',
        resources: {
          primogems: 1500,
          intertwinedFates: 15
        },
        dailyIncome: {
          primogems: 50
        }
      };

      mockStorage['gacha_planning_test'] = JSON.stringify(oldVersionData);

      const result = await PlanningStorage.loadPlanningData('test');

      expect(result.success).toBe(true);
      expect(result.data.version).toBe('1.0.0');
      expect(result.data.resources.primogems).toBe(1500);
      expect(result.data.resources.currentPity).toBe(0); // 新增字段
    });

    test('应自动迁移无版本数据到 v1.0.0', async () => {
      const noVersionData = {
        resources: {
          primogems: 800
        }
      };

      mockStorage['gacha_planning_test'] = JSON.stringify(noVersionData);

      const result = await PlanningStorage.loadPlanningData('test');

      expect(result.success).toBe(true);
      expect(result.data.version).toBe('1.0.0');
      expect(result.data.resources.primogems).toBe(800);
    });
  });

  describe('数据验证', () => {
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

    test('无效数据应验证失败并返回错误详情', () => {
      const invalidData = {
        resources: {
          primogems: 'not a number',
          currentPity: 'fifty'
        },
        targets: 'not an array'
      };

      const result = PlanningStorage.validateData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('边界条件', () => {
    test('空资源数据应正常保存', async () => {
      const emptyData = {
        resources: {},
        poolTimeRange: null,
        dailyIncome: {},
        targets: []
      };

      const result = await PlanningStorage.savePlanningData('test', emptyData);

      expect(result.success).toBe(true);
    });

    test('极大数值应正常处理', async () => {
      const largeData = {
        resources: {
          primogems: 999999999,
          currentPity: 999
        }
      };

      const saveResult = await PlanningStorage.savePlanningData('test', largeData);
      expect(saveResult.success).toBe(true);

      const loadResult = await PlanningStorage.loadPlanningData('test');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data.resources.primogems).toBe(999999999);
    });

    test('特殊字符应正常处理', async () => {
      const specialData = {
        resources: { primogems: 100 },
        targets: [
          { id: '1', name: '测试角色\'s 专武' }
        ]
      };

      const saveResult = await PlanningStorage.savePlanningData('test', specialData);
      expect(saveResult.success).toBe(true);

      const loadResult = await PlanningStorage.loadPlanningData('test');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data.targets[0].name).toBe('测试角色\'s 专武');
    });
  });

  describe('性能测试', () => {
    test('保存操作应在 100ms 内完成', async () => {
      const testData = {
        resources: { primogems: 1000, currentPity: 50 },
        poolTimeRange: { startDate: '2026-04-25', endDate: '2026-05-09' },
        dailyIncome: { primogems: 60 }
      };

      const startTime = Date.now();
      await PlanningStorage.savePlanningData('test', testData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    test('加载操作应在 100ms 内完成', async () => {
      const testData = {
        resources: { primogems: 1000, currentPity: 50 }
      };

      await PlanningStorage.savePlanningData('test', testData);

      const startTime = Date.now();
      await PlanningStorage.loadPlanningData('test');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    test('批量加载 20 个游戏数据应在 1s 内完成', async () => {
      // 保存 20 个游戏数据
      for (let i = 0; i < 20; i++) {
        await PlanningStorage.savePlanningData(`game${i}`, {
          resources: { primogems: i * 100 }
        });
      }

      const startTime = Date.now();
      const result = await PlanningStorage.getAllPlanningData();
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(20);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
