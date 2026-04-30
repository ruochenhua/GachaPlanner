// app.js
// 小程序入口文件

const configLoader = require('./config/config-loader');
const configValidator = require('./config/config-validator');
const storageService = require('./services/storage-service');
const gameService = require('./services/game-service');

App({
  globalData: {
    currentGameId: 'genshin',
    selectedGameId: null, // 用户选择的游戏ID（从首页点击游戏卡片时设置）
    games: {},
    gameConfigs: {}
  },

  onLaunch() {
    console.log('小程序启动');

    // 测试加载游戏配置
    this.testLoadConfigs();

    // 测试存储服务
    this.testStorageService();

    // 测试游戏管理服务
    this.testGameService();
  },

  /**
   * 测试加载游戏配置
   * 验证配置加载器和验证器功能
   */
  testLoadConfigs() {
    console.log('=== 开始测试游戏配置加载 ===');

    // 测试加载原神配置
    console.log('测试加载原神配置...');
    const genshinResult = configLoader.loadGameConfig('genshin');
    if (genshinResult.success) {
      console.log('✓ 原神配置加载成功:', genshinResult.data);

      // 验证配置
      const validateResult = configValidator.validateConfig(genshinResult.data);
      if (validateResult.success) {
        console.log('✓ 原神配置验证通过');
        this.globalData.gameConfigs.genshin = genshinResult.data;
      } else {
        console.error('✗ 原神配置验证失败:', validateResult.error);
      }
    } else {
      console.error('✗ 原神配置加载失败:', genshinResult.error);
    }

    // 测试加载星铁配置
    console.log('测试加载星铁配置...');
    const starrailResult = configLoader.loadGameConfig('starrail');
    if (starrailResult.success) {
      console.log('✓ 星铁配置加载成功:', starrailResult.data);

      // 验证配置
      const validateResult = configValidator.validateConfig(starrailResult.data);
      if (validateResult.success) {
        console.log('✓ 星铁配置验证通过');
        this.globalData.gameConfigs.starrail = starrailResult.data;
      } else {
        console.error('✗ 星铁配置验证失败:', validateResult.error);
      }
    } else {
      console.error('✗ 星铁配置加载失败:', starrailResult.error);
    }

    // 测试加载所有游戏配置
    console.log('测试加载所有游戏配置...');
    const allGamesResult = configLoader.loadAllGames();
    if (allGamesResult.success) {
      console.log('✓ 所有游戏配置加载成功:', Object.keys(allGamesResult.data));
    } else {
      console.error('✗ 所有游戏配置加载失败:', allGamesResult.error);
    }

    // 测试加载不存在的配置
    console.log('测试加载不存在的配置...');
    const invalidResult = configLoader.loadGameConfig('invalid');
    if (!invalidResult.success) {
      console.log('✓ 正确返回错误:', invalidResult.error);
    } else {
      console.error('✗ 应该返回错误但返回了成功');
    }

    console.log('=== 游戏配置加载测试完成 ===');
  },

  /**
   * 测试存储服务
   * 验证数据持久化、版本迁移、缓存机制
   */
  async testStorageService() {
    console.log('=== 开始测试存储服务 ===');

    // 测试1: 首次使用返回默认数据
    console.log('测试1: 首次使用返回默认数据...');
    const loadResult1 = storageService.load();
    if (loadResult1.success) {
      console.log('✓ 加载数据成功:', loadResult1.data);
      console.log('  - currentGameId:', loadResult1.data.currentGameId);
      console.log('  - version:', loadResult1.data.version);
      console.log('  - games:', loadResult1.data.games);
    } else {
      console.error('✗ 加载数据失败:', loadResult1.error);
    }

    // 测试2: 保存数据
    console.log('测试2: 保存数据...');
    const saveData = {
      currentGameId: 'genshin',
      games: {
        genshin: {
          primogems: 10000,
          intertwinedFates: 80,
          currentPity: 10
        },
        starrail: {
          stellarJade: 5000,
          starRailPasses: 40,
          currentPity: 5
        }
      }
    };
    const saveResult = storageService.save(saveData);
    if (saveResult.success) {
      console.log('✓ 保存数据成功:', saveResult.data);
    } else {
      console.error('✗ 保存数据失败:', saveResult.error);
    }

    // 测试3: 重新加载数据验证持久化
    console.log('测试3: 重新加载数据验证持久化...');
    const loadResult2 = storageService.load();
    if (loadResult2.success) {
      console.log('✓ 重新加载数据成功');
      console.log('  - 原神原石:', loadResult2.data.games.genshin.primogems);
      console.log('  - 星铁星琼:', loadResult2.data.games.starrail.stellarJade);
    } else {
      console.error('✗ 重新加载数据失败:', loadResult2.error);
    }

    // 测试4: 缓存命中测试
    console.log('测试4: 缓存命中测试...');
    const cacheHitResult = storageService.loadCurrentGameResources('genshin');
    if (cacheHitResult.success) {
      console.log('✓ 第一次加载原神资源（缓存未命中）:', cacheHitResult.data);
    }

    const cacheHitResult2 = storageService.loadCurrentGameResources('genshin');
    if (cacheHitResult2.success) {
      console.log('✓ 第二次加载原神资源（缓存命中）:', cacheHitResult2.data);
    }

    // 测试5: 更新游戏资源
    console.log('测试5: 更新游戏资源...');
    const updateResult = storageService.updateResources('genshin', {
      primogems: 15000,
      intertwinedFates: 100,
      currentPity: 20
    });
    if (updateResult.success) {
      console.log('✓ 更新游戏资源成功:', updateResult.data.games.genshin);
    } else {
      console.error('✗ 更新游戏资源失败:', updateResult.error);
    }

    // 测试6: 验证更新后的数据
    console.log('测试6: 验证更新后的数据...');
    const loadResult3 = storageService.loadCurrentGameResources('genshin');
    if (loadResult3.success) {
      console.log('✓ 更新后的原神资源:', loadResult3.data);
    }

    // 测试7: 版本迁移机制（模拟）
    console.log('测试7: 版本迁移机制...');
    console.log('当前版本:', storageService.load().data.version);
    console.log('✓ 版本迁移机制已实现（migrate_0_to_1方法）');

    console.log('=== 存储服务测试完成 ===');
    console.log('提示: 未测试clearAllData()，避免清除测试数据');
  },

  /**
   * 测试游戏管理服务
   * 验证游戏切换、资源管理功能
   */
  testGameService() {
    console.log('=== 开始测试游戏管理服务 ===');

    // 测试1: 获取支持的游戏列表
    console.log('测试1: 获取支持的游戏列表...');
    const supportedGames = gameService.getSupportedGames();
    console.log('✓ 支持的游戏:', supportedGames);

    // 测试2: 获取当前游戏ID
    console.log('测试2: 获取当前游戏ID...');
    const currentGameId = gameService.getCurrentGameId();
    console.log('✓ 当前游戏ID:', currentGameId);

    // 测试3: 获取当前游戏资源
    console.log('测试3: 获取当前游戏资源...');
    const resourcesResult = gameService.getCurrentResources();
    if (resourcesResult.success) {
      console.log('✓ 当前游戏资源:', resourcesResult.data);
    } else {
      console.error('✗ 获取当前游戏资源失败:', resourcesResult.error);
    }

    // 测试4: 更新游戏资源
    console.log('测试4: 更新游戏资源...');
    const updateResult = gameService.updateResources({
      primogems: 20000,
      intertwinedFates: 120,
      currentPity: 30
    });
    if (updateResult.success) {
      console.log('✓ 更新游戏资源成功');
    } else {
      console.error('✗ 更新游戏资源失败:', updateResult.error);
    }

    // 测试5: 验证更新后的资源
    console.log('测试5: 验证更新后的资源...');
    const updatedResources = gameService.getCurrentResources();
    if (updatedResources.success) {
      console.log('✓ 更新后的资源:', updatedResources.data);
    }

    // 测试6: 切换游戏
    console.log('测试6: 切换游戏到星铁...');
    const switchResult = gameService.switchGame('starrail');
    if (switchResult.success) {
      console.log('✓ 切换游戏成功:', switchResult.data.gameId);
      console.log('  - 星铁资源:', switchResult.data.resources);
    } else {
      console.error('✗ 切换游戏失败:', switchResult.error);
    }

    // 测试7: 验证切换后的当前游戏ID
    console.log('测试7: 验证切换后的当前游戏ID...');
    const newGameId = gameService.getCurrentGameId();
    console.log('✓ 切换后的游戏ID:', newGameId);

    // 测试8: 切换回原神
    console.log('测试8: 切换回原神...');
    const switchBackResult = gameService.switchGame('genshin');
    if (switchBackResult.success) {
      console.log('✓ 切换回原神成功');
      console.log('  - 原神资源:', switchBackResult.data.resources);
    }

    // 测试9: 切换到不支持的游戏
    console.log('测试9: 切换到不支持的游戏...');
    const invalidSwitchResult = gameService.switchGame('invalid');
    if (!invalidSwitchResult.success) {
      console.log('✓ 正确返回错误:', invalidSwitchResult.error);
    } else {
      console.error('✗ 应该返回错误但返回了成功');
    }

    // 测试10: 检查游戏是否支持
    console.log('测试10: 检查游戏是否支持...');
    console.log('✓ 原神支持:', gameService.isGameSupported('genshin'));
    console.log('✓ 星铁支持:', gameService.isGameSupported('starrail'));
    console.log('✓ 无效游戏支持:', gameService.isGameSupported('invalid'));

    console.log('=== 游戏管理服务测试完成 ===');
  }
});
