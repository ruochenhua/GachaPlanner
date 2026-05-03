/**
 * 端到端测试：验证目标的大保底状态在保存/加载中是否保留
 */

const PlanningStorage = require('../../services/planning-storage');

// Mock wx API
global.wx = {
  storage: {},
  getStorageSync(key) {
    const val = this.storage[key];
    return val !== undefined ? val : '';
  },
  setStorageSync(key, value) {
    this.storage[key] = value;
  },
  removeStorageSync(key) {
    delete this.storage[key];
  }
};

describe('目标大保底状态持久化', () => {
  const gameId = 'genshin';

  beforeEach(() => {
    wx.storage = {};
  });

  test('保存包含 isGuaranteed 的目标，加载后应保留', async () => {
    const target = {
      id: 'target_test_1',
      name: '胡桃',
      type: 'character',
      desiredRank: 0,
      isGuaranteed: true,
      currentPity: 45,
      poolStartDate: '',
      poolEndDate: ''
    };

    // 模拟 planning.js 中的 savePlanningData 调用
    const dataToSave = {
      resources: { primogems: 16000 },
      poolTimeRange: { startDate: '', endDate: '' },
      dailyIncome: { primogems: 0, events: 0 },
      targets: [target]
    };

    await PlanningStorage.savePlanningData(gameId, dataToSave);

    // 加载
    const result = await PlanningStorage.loadPlanningData(gameId);
    expect(result.success).toBe(true);
    expect(result.data.targets).toHaveLength(1);
    expect(result.data.targets[0].isGuaranteed).toBe(true);
    expect(result.data.targets[0].currentPity).toBe(45);
  });

  test('编辑目标修改 isGuaranteed，应正确保存', async () => {
    // 先保存一个小保底目标
    const target1 = {
      id: 'target_test_2',
      name: '胡桃',
      type: 'character',
      desiredRank: 0,
      isGuaranteed: false,
      poolStartDate: '',
      poolEndDate: ''
    };

    await PlanningStorage.savePlanningData(gameId, {
      resources: {},
      poolTimeRange: {},
      dailyIncome: { primogems: 0, events: 0 },
      targets: [target1]
    });

    // 模拟编辑：修改 isGuaranteed 为 true
    const targetModified = { ...target1, isGuaranteed: true, currentPity: 50 };
    const loadResult = await PlanningStorage.loadPlanningData(gameId);
    const data = loadResult.data;
    data.targets = data.targets.map(t => t.id === targetModified.id ? targetModified : t);
    await PlanningStorage.savePlanningData(gameId, data);

    // 重新加载验证
    const result = await PlanningStorage.loadPlanningData(gameId);
    expect(result.data.targets[0].isGuaranteed).toBe(true);
    expect(result.data.targets[0].currentPity).toBe(50);
  });

  test('多目标各自独立的 isGuaranteed 应分别保留', async () => {
    const targets = [
      { id: 't1', name: '胡桃', type: 'character', desiredRank: 0, isGuaranteed: true, currentPity: 80 },
      { id: 't2', name: '护摩', type: 'weapon', desiredRank: 0, isGuaranteed: false, currentPity: 30 }
    ];

    await PlanningStorage.savePlanningData(gameId, {
      resources: {},
      poolTimeRange: {},
      dailyIncome: { primogems: 0, events: 0 },
      targets
    });

    const result = await PlanningStorage.loadPlanningData(gameId);
    expect(result.data.targets[0].isGuaranteed).toBe(true);
    expect(result.data.targets[0].currentPity).toBe(80);
    expect(result.data.targets[1].isGuaranteed).toBe(false);
    expect(result.data.targets[1].currentPity).toBe(30);
  });
});
