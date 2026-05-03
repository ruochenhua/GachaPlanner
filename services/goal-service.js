const PlanningStorage = require('./planning-storage');

class GoalService {
  async setGoal(gameId, target) {
    return PlanningStorage.saveTarget(gameId, target);
  }

  async updateGoal(gameId, targetId, target) {
    return PlanningStorage.updateTarget(gameId, targetId, target);
  }

  async deleteGoal(gameId, targetId) {
    return PlanningStorage.removeTarget(gameId, targetId);
  }

  async getGoals() {
    const gameIdsResult = await PlanningStorage.getAllGameIds();
    if (!gameIdsResult.success) {
      return gameIdsResult;
    }

    const allGoals = [];
    for (const gameId of gameIdsResult.data) {
      const targetsResult = await PlanningStorage.getTargets(gameId);
      if (targetsResult.success) {
        for (const target of targetsResult.data) {
          allGoals.push({ gameId, ...target });
        }
      }
    }

    return { success: true, data: allGoals };
  }

  async getGoalsByGame(gameId) {
    return PlanningStorage.getTargets(gameId);
  }
}

const goalService = new GoalService();
module.exports = goalService;