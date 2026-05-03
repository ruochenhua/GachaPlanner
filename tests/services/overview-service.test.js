/**
 * OverviewService 单元测试
 */

const overviewService = require('../../services/overview-service');

// Mock CalculatorFactory
jest.mock('../../core/calculator/calculator-factory', () => ({
  createCalculator: jest.fn((config) => ({
    calculate: jest.fn(({ target }) => {
      // 简单模拟：抽数越多概率越高
      const prob = Math.min(1, (target.pulls || 0) / 100);
      return {
        success: true,
        data: [
          { pull: 0, cumulativeProbability: 0 },
          { pull: target.pulls, cumulativeProbability: prob }
        ]
      };
    })
  }))
}));

describe('OverviewService', () => {
  describe('detectConflicts - 冲突检测', () => {
    test('无目标时不返回冲突', () => {
      const games = [
        { gameId: 'g1', name: '原神', probability: 0.3, target: null }
      ];
      const result = overviewService.detectConflicts(games);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('单个低概率目标不触发冲突', () => {
      const games = [
        { gameId: 'g1', name: '原神', probability: 0.3, target: { name: '胡桃' } }
      ];
      const result = overviewService.detectConflicts(games);
      expect(result.data.length).toBe(0);
    });

    test('两个低概率目标触发冲突', () => {
      const games = [
        { gameId: 'g1', name: '原神', probability: 0.3, target: { name: '胡桃' } },
        { gameId: 'g2', name: '星铁', probability: 0.5, target: { name: '黄泉' } }
      ];
      const result = overviewService.detectConflicts(games);
      expect(result.data.length).toBe(2);
      expect(result.data[0].gameName).toBe('原神');
      expect(result.data[1].gameName).toBe('星铁');
    });

    test('自定义阈值', () => {
      const games = [
        { gameId: 'g1', name: '原神', probability: 0.6, target: { name: '胡桃' } },
        { gameId: 'g2', name: '星铁', probability: 0.6, target: { name: '黄泉' } }
      ];
      // 阈值 0.7，两个都低于阈值
      const result = overviewService.detectConflicts(games, 0.7);
      expect(result.data.length).toBe(2);
    });
  });

  describe('calculateAllocation - 资源分配守恒', () => {
    const mockConfig = {
      resources: { primogems: { name: '原石' }, intertwinedFates: { name: '纠缠之缘' } },
      conversionRate: { primogemsToFate: 160 },
      hardPity: 90
    };

    test('单游戏不调整', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.8, resources: {}, config: mockConfig, target: { name: '胡桃' } }
      ];
      const result = overviewService.calculateAllocation(games, { g1: 10 });
      expect(result.success).toBe(true);
      expect(result.data[0].newPulls).toBe(100);
      expect(result.data[0].delta).toBe(0);
    });

    test('增加某游戏抽数时从概率最高的游戏扣除', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.9, resources: {}, config: mockConfig, target: { name: '胡桃' } },
        { gameId: 'g2', name: '星铁', totalPulls: 80, probability: 0.5, resources: {}, config: mockConfig, target: { name: '黄泉' } }
      ];
      const result = overviewService.calculateAllocation(games, { g2: 20 });
      expect(result.success).toBe(true);
      // g2 增加 20，从概率最高的 g1 扣除
      const g1Result = result.data.find(r => r.gameId === 'g1');
      const g2Result = result.data.find(r => r.gameId === 'g2');
      expect(g2Result.newPulls).toBe(100);
      expect(g1Result.newPulls).toBe(80);
      expect(g1Result.delta).toBe(-20);
      expect(g2Result.delta).toBe(20);
    });

    test('减少某游戏抽数时分配给其他游戏', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.9, resources: {}, config: mockConfig, target: { name: '胡桃' } },
        { gameId: 'g2', name: '星铁', totalPulls: 80, probability: 0.5, resources: {}, config: mockConfig, target: { name: '黄泉' } }
      ];
      const result = overviewService.calculateAllocation(games, { g1: -20 });
      expect(result.success).toBe(true);
      const g1Result = result.data.find(r => r.gameId === 'g1');
      const g2Result = result.data.find(r => r.gameId === 'g2');
      expect(g1Result.newPulls).toBe(80);
      expect(g2Result.newPulls).toBe(100);
    });
  });

  describe('generateStrategies - 策略生成', () => {
    const mockConfig = {
      resources: { primogems: { name: '原石' }, intertwinedFates: { name: '纠缠之缘' } },
      conversionRate: { primogemsToFate: 160 },
      hardPity: 90
    };

    test('空数组返回空策略', () => {
      const result = overviewService.generateStrategies([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('单游戏生成现状和集中两种策略', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.8, resources: {}, config: mockConfig, target: { name: '胡桃' } }
      ];
      const result = overviewService.generateStrategies(games);
      expect(result.data.length).toBe(2);
      expect(result.data[0].id).toBe('status-quo');
      expect(result.data[1].id).toBe('concentrate');
    });

    test('多游戏生成至少三种策略', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.8, resources: {}, config: mockConfig, target: { name: '胡桃' } },
        { gameId: 'g2', name: '星铁', totalPulls: 80, probability: 0.5, resources: {}, config: mockConfig, target: { name: '黄泉' } }
      ];
      const result = overviewService.generateStrategies(games);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      const ids = result.data.map(s => s.id);
      expect(ids).toContain('status-quo');
      expect(ids).toContain('concentrate');
    });

    test('策略包含 allocations', () => {
      const games = [
        { gameId: 'g1', name: '原神', totalPulls: 100, probability: 0.8, resources: {}, config: mockConfig, target: { name: '胡桃' } }
      ];
      const result = overviewService.generateStrategies(games);
      const statusQuo = result.data.find(s => s.id === 'status-quo');
      expect(statusQuo.allocations.length).toBe(1);
      expect(statusQuo.allocations[0].pulls).toBe(100);
    });
  });
});
