const CalculatorFactory = require('../core/calculator/calculator-factory');

function calculateGameProbability(resources, config) {
  if (!resources || !config) return 0;
  const conversionRate = config.conversionRate?.primogemsToFate || 160;
  const resourceKeys = Object.keys(config.resources || {});
  if (resourceKeys.length === 0) return 0;
  const primaryResourceKey = resourceKeys[0];
  const secondaryResourceKey = resourceKeys[1] || null;
  const primaryValue = Number(resources[primaryResourceKey]) || 0;
  const secondaryValue = secondaryResourceKey ? (Number(resources[secondaryResourceKey]) || 0) : 0;
  const totalPulls = Math.floor(primaryValue / conversionRate) + secondaryValue;
  if (totalPulls === 0) return 0;
  const target = { pulls: Math.min(totalPulls, config.hardPity || 90), currentPity: 0 };
  try {
    const calculator = CalculatorFactory.createCalculator(config);
    const result = calculator.calculate({ resources, target, config });
    if (result.success && result.data && result.data.length > 0) {
      return result.data[result.data.length - 1].cumulativeProbability;
    }
  } catch (err) {
    console.error('概率计算异常:', err);
  }
  return 0;
}

function buildResourcesFromPulls(totalPulls, originalResources, config) {
  const conversionRate = config.conversionRate?.primogemsToFate || 160;
  const resourceKeys = Object.keys(config.resources || {});
  const newResources = { ...originalResources };
  const secondaryKey = resourceKeys[1];
  if (secondaryKey) {
    newResources[secondaryKey] = totalPulls;
    newResources[resourceKeys[0]] = 0;
  } else {
    newResources[resourceKeys[0]] = totalPulls * conversionRate;
  }
  return newResources;
}

class OverviewService {
  calculateAllocation(games, adjustment) {
    if (!games || games.length === 0) {
      return { success: true, data: [] };
    }

    if (games.length === 1) {
      return { success: true, data: games.map(g => ({ gameId: g.gameId, newPulls: g.totalPulls, newProbability: g.probability, delta: 0 })) };
    }

    const gameMap = new Map(games.map(g => [g.gameId, { ...g }]));
    const adjustedGameId = Object.keys(adjustment)[0];
    const delta = adjustment[adjustedGameId];

    if (!gameMap.has(adjustedGameId)) {
      return { success: false, error: '游戏不存在' };
    }

    const adjustedGame = gameMap.get(adjustedGameId);
    const newPulls = Math.max(0, adjustedGame.totalPulls + delta);

    if (delta === 0) {
      return { success: true, data: games.map(g => ({ gameId: g.gameId, newPulls: g.totalPulls, newProbability: g.probability, delta: 0 })) };
    }

    let remainingDeduction = Math.abs(newPulls - adjustedGame.totalPulls);

    if (delta > 0) {
      const otherGames = [...gameMap.values()]
        .filter(g => g.gameId !== adjustedGameId)
        .sort((a, b) => b.probability - a.probability);

      for (const game of otherGames) {
        if (remainingDeduction <= 0) break;
        const deductAmount = Math.min(game.totalPulls, remainingDeduction);
        game.totalPulls -= deductAmount;
        remainingDeduction -= deductAmount;
      }
    } else {
      const otherGames = [...gameMap.values()]
        .filter(g => g.gameId !== adjustedGameId)
        .sort((a, b) => a.probability - b.probability);

      for (const game of otherGames) {
        if (remainingDeduction <= 0) break;
        game.totalPulls += remainingDeduction;
        remainingDeduction = 0;
      }
    }

    adjustedGame.totalPulls = newPulls;

    const result = [];
    for (const [gameId, game] of gameMap) {
      const originalGame = games.find(g => g.gameId === gameId);
      const newResources = buildResourcesFromPulls(game.totalPulls, originalGame.resources, originalGame.config);
      const newProbability = calculateGameProbability(newResources, originalGame.config);
      result.push({
        gameId,
        gameName: game.name || game.gameName,
        newPulls: game.totalPulls,
        newProbability,
        delta: game.totalPulls - originalGame.totalPulls
      });
    }

    return { success: true, data: result };
  }

  generateStrategies(games) {
    if (!games || games.length === 0) {
      return { success: true, data: [] };
    }

    const totalPulls = games.reduce((sum, g) => sum + g.totalPulls, 0);
    const activeGames = games.filter(g => g.target);
    const singleGame = activeGames.length <= 1;

    const strategies = [];

    strategies.push({
      id: 'status-quo',
      name: '保持现状',
      description: '维持当前各游戏的资源分配',
      allocations: games.map(g => ({
        gameId: g.gameId,
        gameName: g.name || g.gameName,
        pulls: g.totalPulls,
        probability: g.probability
      })),
      conclusion: this._generateConclusion(games, 'status-quo'),
      topUpAmount: 0
    });

    if (activeGames.length > 0) {
      const optimalGame = activeGames.reduce((best, current) => {
        const bestProb = this._estimateConcentratedProbability(best, totalPulls);
        const currentProb = this._estimateConcentratedProbability(current, totalPulls);
        return currentProb > bestProb ? current : best;
      }, activeGames[0]);

      const concentratedAllocations = games.map(g => {
        if (g.gameId === optimalGame.gameId) {
          const newResources = buildResourcesFromPulls(totalPulls, g.resources, g.config);
          const newProbability = calculateGameProbability(newResources, g.config);
          return { gameId: g.gameId, gameName: g.name || g.gameName, pulls: totalPulls, probability: newProbability };
        }
        return { gameId: g.gameId, gameName: g.name || g.gameName, pulls: 0, probability: 0 };
      });

      strategies.push({
        id: 'concentrate',
        name: `集中${optimalGame.name || optimalGame.gameName}`,
        description: `将所有资源集中到${optimalGame.name || optimalGame.gameName}以获得最高达成概率`,
        allocations: concentratedAllocations,
        conclusion: this._generateConclusion(games, 'concentrate', optimalGame),
        topUpAmount: 0,
        isRecommended: true
      });
    }

    if (!singleGame && totalPulls > 0) {
      const avgPulls = Math.floor(totalPulls / activeGames.length);
      const balancedAllocations = games.map(g => {
        const newResources = buildResourcesFromPulls(avgPulls, g.resources, g.config);
        const newProbability = calculateGameProbability(newResources, g.config);
        return { gameId: g.gameId, gameName: g.name || g.gameName, pulls: avgPulls, probability: newProbability };
      });

      const allAbove60 = balancedAllocations.every(a => a.probability >= 0.6);
      if (allAbove60) {
        strategies.push({
          id: 'balanced',
          name: '均衡分配',
          description: '将资源平均分配，使各游戏达成概率均衡',
          allocations: balancedAllocations,
          conclusion: this._generateConclusion(games, 'balanced'),
          topUpAmount: 0
        });
      } else {
        let additionalPulls = 0;
        let found = false;
        while (!found && additionalPulls < 5000) {
          additionalPulls += 10;
          const testTotal = totalPulls + additionalPulls;
          const testAvg = Math.floor(testTotal / activeGames.length);
          const testAllAbove80 = activeGames.every(g => {
            const testResources = buildResourcesFromPulls(testAvg, g.resources, g.config);
            const testProbability = calculateGameProbability(testResources, g.config);
            return testProbability >= 0.8;
          });
          if (testAllAbove80) found = true;
        }

        if (found) {
          const topUpAllocations = games.map(g => {
            const newResources = buildResourcesFromPulls(totalPulls + additionalPulls, g.resources, g.config);
            const newProbability = calculateGameProbability(newResources, g.config);
            return { gameId: g.gameId, gameName: g.name || g.gameName, pulls: totalPulls + additionalPulls, probability: newProbability };
          });

          strategies.push({
            id: 'top-up',
            name: '补充预算',
            description: `建议补充 ${additionalPulls} 抽可使所有目标稳定达成`,
            allocations: topUpAllocations,
            conclusion: `补充 ${additionalPulls} 抽后，所有游戏达成概率可提升至 80% 以上`,
            topUpAmount: additionalPulls
          });
        }
      }
    }

    return { success: true, data: strategies };
  }

  _estimateConcentratedProbability(game, totalPulls) {
    const newResources = buildResourcesFromPulls(totalPulls, game.resources, game.config);
    return calculateGameProbability(newResources, game.config);
  }

  _generateConclusion(games, type, optimalGame) {
    const avgProb = games.reduce((sum, g) => sum + g.probability, 0) / games.length;
    if (type === 'status-quo') {
      if (avgProb >= 0.8) return '当前分配较为理想，建议保持';
      return '当前分配下达成概率一般，可考虑调整';
    }
    if (type === 'concentrate') {
      return `集中投入${optimalGame?.name || ''}可获得最高达成概率`;
    }
    return '均衡分配可使各游戏达成概率较为平均';
  }

  detectConflicts(games, threshold = 0.8) {
    if (!games || games.length < 2) {
      return { success: true, data: [] };
    }

    const conflicts = games
      .filter(g => g.target && g.probability < threshold)
      .map(g => ({
        gameId: g.gameId,
        gameName: g.name || g.gameName,
        targetName: g.target.name,
        probability: g.probability
      }));

    return { success: true, data: conflicts };
  }
}

const overviewService = new OverviewService();
module.exports = overviewService;