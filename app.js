// app.js
// 小程序入口文件

const configLoader = require('./config/config-loader');
const configValidator = require('./config/config-validator');
const gameService = require('./services/game-service');
const themeService = require('./services/theme-service');

App({
  globalData: {
    currentGameId: 'genshin',
    selectedGameId: null,
    games: {},
    gameConfigs: {}
  },

  onLaunch() {
    // 加载游戏配置到全局数据
    const supportedGames = ['genshin', 'starrail'];
    for (const gameId of supportedGames) {
      const result = configLoader.loadGameConfig(gameId);
      if (result.success) {
        const validateResult = configValidator.validateConfig(result.data);
        if (validateResult.success) {
          this.globalData.gameConfigs[gameId] = result.data;
        }
      }
    }

    // 初始化主题服务
    themeService.init();
  },

  onShow() {
    // 每次显示时同步主题（处理从系统设置切回的场景）
    themeService.apply();
  }
});
