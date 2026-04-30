# Story 1.4: 游戏管理服务实现

Status: review

## Story

As a 用户,
I want 切换当前管理的游戏,
so that 对不同游戏进行资源管理和规划.

## Acceptance Criteria

1. **Given** 本地存储服务已实现
   **And** 游戏配置数据已创建
   **When** 实现game-service.js
   **Then** 服务提供switchGame()方法切换游戏
   **And** 提供getCurrentResources()获取当前游戏资源
   **And** 提供updateResources()更新资源数据
   **And** 游戏切换时自动保存前一游戏数据
   **And** 切换后立即加载新游戏数据

## Tasks / Subtasks

- [x] **Task 1: 创建game-service.js基础结构** (AC: 1)
  - [x] 1.1 创建services/game-service.js文件
  - [x] 1.2 定义GameService类
  - [x] 1.3 实现constructor初始化依赖
  - [x] 1.4 注入storageService和configLoader依赖

- [x] **Task 2: 实现switchGame()方法** (AC: 1)
  - [x] 2.1 验证目标游戏存在
  - [x] 2.2 保存当前游戏数据（如有）
  - [x] 2.3 更新currentGameId
  - [x] 2.4 加载新游戏资源数据
  - [x] 2.5 返回Result模式对象

- [x] **Task 3: 实现getCurrentResources()方法** (AC: 1)
  - [x] 3.1 获取当前游戏ID
  - [x] 3.2 调用storageService.loadCurrentGameResources()
  - [x] 3.3 返回当前游戏资源数据

- [x] **Task 4: 实现updateResources()方法** (AC: 1)
  - [x] 4.1 验证资源数据格式
  - [x] 4.2 调用storageService.updateResources()
  - [x] 4.3 返回Result模式对象

- [x] **Task 5: 实现辅助方法** (AC: 1)
  - [x] 5.1 实现getCurrentGameId()获取当前游戏ID
  - [x] 5.2 实现getSupportedGames()获取支持的游戏列表
  - [x] 5.3 实现getGameConfig(gameId)获取游戏配置
  - [x] 5.4 实现isGameSupported(gameId)检查游戏是否支持

- [x] **Task 6: 验证游戏管理服务** (AC: 1)
  - [x] 6.1 在app.js中测试游戏切换功能
  - [x] 6.2 测试getCurrentResources()获取资源
  - [x] 6.3 测试updateResources()更新资源
  - [x] 6.4 测试游戏切换时数据自动保存和加载
  - [x] 6.5 Console输出测试结果

## Dev Notes

### 关键技术决策

**服务层架构：**
- GameService作为游戏管理服务，协调存储服务和配置加载器
- 服务层中介模式：pages → gameService → storageService/configLoader
- 单例模式导出gameService实例

**状态管理：**
- 使用storageService管理数据持久化
- currentGameId存储在用户数据中
- 游戏切换时自动保存和加载数据

### GameService类设计

```javascript
class GameService {
  constructor(storageService, configLoader) {
    this.storageService = storageService;
    this.configLoader = configLoader;
    this.currentGameId = null;
  }

  // 核心方法
  switchGame(gameId)              // 切换游戏
  getCurrentResources()           // 获取当前游戏资源
  updateResources(resources)      // 更新资源数据

  // 辅助方法
  getCurrentGameId()              // 获取当前游戏ID
  getSupportedGames()             // 获取支持的游戏列表
  getGameConfig(gameId)           // 获取游戏配置
  isGameSupported(gameId)         // 检查游戏是否支持
}
```

### 实现要点

**游戏切换流程：**

```javascript
switchGame(gameId) {
  // 1. 验证目标游戏存在
  if (!this.isGameSupported(gameId)) {
    return error(`不支持的游戏：${gameId}`);
  }

  // 2. 保存当前游戏数据（如有）
  if (this.currentGameId) {
    const currentResources = this.storageService.loadCurrentGameResources(this.currentGameId);
    if (currentResources.success) {
      this.storageService.updateResources(this.currentGameId, currentResources.data);
    }
  }

  // 3. 更新currentGameId
  this.currentGameId = gameId;

  // 4. 加载新游戏资源数据
  const resourcesResult = this.storageService.loadCurrentGameResources(gameId);
  if (!resourcesResult.success) {
    return resourcesResult;
  }

  // 5. 更新用户数据的currentGameId
  const userDataResult = this.storageService.load();
  if (userDataResult.success) {
    userDataResult.data.currentGameId = gameId;
    this.storageService.save(userDataResult.data);
  }

  return success({
    gameId,
    resources: resourcesResult.data
  });
}
```

**获取当前游戏资源：**

```javascript
getCurrentResources() {
  const gameId = this.getCurrentGameId();
  if (!gameId) {
    return error('未设置当前游戏');
  }

  return this.storageService.loadCurrentGameResources(gameId);
}
```

**更新资源数据：**

```javascript
updateResources(resources) {
  const gameId = this.getCurrentGameId();
  if (!gameId) {
    return error('未设置当前游戏');
  }

  // 验证资源数据格式
  if (!resources || typeof resources !== 'object') {
    return error('资源数据格式错误');
  }

  return this.storageService.updateResources(gameId, resources);
}
```

**辅助方法实现：**

```javascript
getCurrentGameId() {
  if (this.currentGameId) {
    return this.currentGameId;
  }

  // 从存储中加载
  const result = this.storageService.load();
  if (result.success && result.data.currentGameId) {
    this.currentGameId = result.data.currentGameId;
    return this.currentGameId;
  }

  // 返回默认游戏
  return 'genshin';
}

getSupportedGames() {
  const configResult = this.configLoader.loadAllGames();
  if (configResult.success) {
    return Object.keys(configResult.data);
  }
  return ['genshin', 'starrail'];
}

getGameConfig(gameId) {
  return this.configLoader.loadGameConfig(gameId);
}

isGameSupported(gameId) {
  const supportedGames = this.getSupportedGames();
  return supportedGames.includes(gameId);
}
```

### 数据流设计

**游戏切换数据流：**

```
用户调用switchGame('starrail')
  ↓
GameService.switchGame()
  ↓
1. 验证游戏存在
  ↓
2. 保存当前游戏数据
  ↓
3. 更新currentGameId
  ↓
4. 加载新游戏资源
  ↓
5. 更新用户数据
  ↓
返回新游戏资源
```

**资源更新数据流：**

```
用户调用updateResources({primogems: 10000})
  ↓
GameService.updateResources()
  ↓
1. 获取当前游戏ID
  ↓
2. 验证资源数据
  ↓
3. 调用storageService.updateResources()
  ↓
返回更新结果
```

### 错误处理

**错误场景：**
- 切换到不支持的游戏
- 未设置当前游戏
- 资源数据格式错误
- 存储服务调用失败

**错误处理策略：**
- 返回Result模式对象{success, data, error}
- 错误信息用户友好
- 关键操作记录console日志

### 测试验证

**验证游戏切换：**
- [ ] switchGame('starrail')成功切换到星铁
- [ ] 切换时自动保存前一游戏数据
- [ ] 切换后立即加载新游戏数据
- [ ] 切换到不支持的游戏返回错误

**验证资源管理：**
- [ ] getCurrentResources()返回当前游戏资源
- [ ] updateResources()成功更新资源
- [ ] 更新后数据持久化

**验证辅助方法：**
- [ ] getCurrentGameId()返回正确游戏ID
- [ ] getSupportedGames()返回支持的游戏列表
- [ ] isGameSupported()正确判断游戏支持

### Project Structure Notes

**文件位置：**
- services/game-service.js - 游戏管理服务主文件

**模块依赖：**
- services/storage-service.js - 存储服务
- config/config-loader.js - 配置加载器
- utils/result.js - Result模式工具函数

**命名规范：**
- 文件命名：kebab-case（game-service.js）
- 类名：PascalCase（GameService）
- 方法名：camelCase（switchGame）

### References

- [Source: architecture.md#状态管理方法]
- [Source: architecture.md#模块间通信模式]
- [Source: prd.md#FR2-切换游戏]
- [Source: prd.md#FR4-输入资源数量]
- [Source: prd.md#FR5-编辑资源数据]
- [Source: epics.md#Story 1.4]

### Common LLM Mistakes to Prevent

**避免以下常见错误：**

1. **不要忘记保存当前游戏数据** - 切换游戏前必须保存前一游戏数据
2. **不要跳过游戏验证** - switchGame()必须验证目标游戏存在
3. **不要忽略currentGameId更新** - 切换游戏后必须更新currentGameId到存储
4. **不要硬编码游戏列表** - 使用configLoader动态获取支持的游戏

### Previous Story Context

**Story 1.3已实现：**
- services/storage-service.js存储服务
- loadCurrentGameResources()和updateResources()方法
- 数据持久化和智能缓存机制

**Story 1.2已实现：**
- config/config-loader.js配置加载器
- loadGameConfig()和loadAllGames()方法
- 游戏配置数据结构

**Story 1.4依赖：**
- storageService提供数据持久化支持
- configLoader提供游戏配置支持
- Result模式工具函数

### Next Story Context

**Story 1.5将依赖：**
- game-service.js已实现并验证可用
- switchGame()、getCurrentResources()、updateResources()方法可用
- 为首页提供游戏管理支持

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

无错误日志，所有测试通过。

### Completion Notes List

**实现完成：**

1. **GameService类创建**
   - 创建services/game-service.js文件
   - 实现完整游戏管理服务，协调存储服务和配置加载器
   - 注入storageService和configLoader依赖

2. **核心方法实现**
   - switchGame(gameId)：验证游戏存在，保存当前游戏数据，更新currentGameId，加载新游戏资源
   - getCurrentResources()：获取当前游戏ID，调用storageService加载资源
   - updateResources(resources)：验证资源格式，调用storageService更新资源

3. **辅助方法实现**
   - getCurrentGameId()：从缓存或存储获取当前游戏ID，默认返回'genshin'
   - getSupportedGames()：从configLoader获取支持的游戏列表
   - getGameConfig(gameId)：获取游戏配置
   - isGameSupported(gameId)：检查游戏是否支持

4. **游戏切换流程**
   - 验证目标游戏存在
   - 保存当前游戏数据（如有）
   - 更新currentGameId
   - 加载新游戏资源数据
   - 更新用户数据的currentGameId到存储

5. **测试验证**
   - 在app.js中添加testGameService()测试方法
   - 测试游戏切换、资源获取、资源更新、游戏支持检查等场景
   - 所有测试通过，Console输出验证成功

**关键技术决策：**

- 服务层中介模式：pages → gameService → storageService/configLoader
- 单例模式导出gameService实例
- 游戏切换时自动保存前一游戏数据
- 使用configLoader动态获取支持的游戏列表

**测试结果：**

```
✓ 支持的游戏: ['genshin', 'starrail']
✓ 当前游戏ID: genshin
✓ 当前游戏资源获取成功
✓ 更新游戏资源成功
✓ 切换游戏到星铁成功
✓ 切换后的游戏ID: starrail
✓ 切换回原神成功
✓ 正确返回错误: 不支持的游戏：invalid
✓ 游戏支持检查正确
```

### File List

**创建的文件：**
- services/game-service.js (创建)
- app.js (修改，添加测试代码)