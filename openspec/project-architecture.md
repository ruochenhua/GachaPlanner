# GachaPlanner 项目架构文档

## 1. 技术架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        微信小程序容器                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   WXML视图   │  │   WXSS样式   │  │      JS逻辑层          │ │
│  │  (页面+组件) │  │  (主题+变量) │  │  Page / Component      │ │
│  └──────┬──────┘  └─────────────┘  └───────────┬─────────────┘ │
│         │                                        │              │
│         └────────────────────────────────────────┘              │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     服务层 (Services)                      │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │ │
│  │  │GameSvc  │ │Storage  │ │History  │ │Planning │        │ │
│  │  │游戏管理  │ │数据存储  │ │历史记录  │ │规划管理  │        │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │ │
│  │  │Reminder │ │Custom   │ │Preset   │ │Config   │        │ │
│  │  │提醒服务  │ │GameSvc  │ │Library  │ │Export   │        │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │ │
│  │  ┌─────────┐ ┌─────────┐                                 │ │
│  │  │ImageGen │ │ShareSvc │                                 │ │
│  │  │图片生成  │ │分享服务  │                                 │ │
│  │  └─────────┘ └─────────┘                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     核心层 (Core)                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │              CalculatorFactory                       │  │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │ │
│  │  │  │HardPity │ │SoftPity │ │ NoPity  │ │Guarantee│  │  │ │
│  │  │  │硬保底   │ │软保底   │ │无保底   │ │大小保底 │  │  │ │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │ │
│  │  │  │  Luck   │ │MultiPool│ │Dynamic  │ │Combined │  │  │ │
│  │  │  │幸运值   │ │多池联动 │ │动态概率 │ │综合概率 │  │  │ │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                     │ │
│  │  │Analytics│ │Suggestion│ │Constants│                     │ │
│  │  │准确度分析│ │策略建议  │ │常量定义  │                     │ │
│  │  └─────────┘ └─────────┘ └─────────┘                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  配置层 (Config)                           │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────────────────┐ │ │
│  │  │Config   │ │Config   │ │      游戏配置文件            │ │ │
│  │  │Loader   │ │Validator│ │  ┌─────────┐ ┌─────────┐    │ │ │
│  │  │配置加载  │ │配置验证  │ │  │genshin  │ │starrail │    │ │ │
│  │  └─────────┘ └─────────┘ │  │arknights│ │fgo      │    │ │ │
│  │                          │  │hok      │ │onmyoji  │    │ │ │
│  │                          │  └─────────┘ └─────────┘    │ │ │
│  │                          │  ConfigTemplateEnhanced      │ │ │
│  │                          └─────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  基础设施层 (Utils)                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │ │
│  │  │ Result  │ │Debounce │ │PerfMon  │ │ Time    │         │ │
│  │  │结果对象  │ │防抖节流  │ │性能监控  │ │时间工具  │         │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              微信小程序原生 API                             │ │
│  │         wx.getStorage / wx.setStorage                     │ │
│  │         wx.showModal / wx.showToast                       │ │
│  │         wx.request / wx.canvas                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 模块依赖关系

```
pages/ ──▶ services/ ──▶ core/
   │           │           │
   │           │           ▼
   │           │      config/
   │           │           │
   │           ▼           ▼
   └────▶ components/ ◀── utils/
```

**依赖规则**：
- 页面可以依赖服务、组件、工具
- 服务可以依赖核心、配置、工具
- 核心可以依赖配置、工具
- 组件可以依赖工具，但不应依赖服务（通过页面传入数据）
- 不允许循环依赖

## 3. 核心模块详解

### 3.1 计算器工厂（CalculatorFactory）

**位置**：`core/calculator/calculator-factory.js`

**职责**：
- 根据游戏配置的 `pityType` 创建对应的计算器实例
- 支持运行时注册新的计算器类型
- 自动检测大小保底机制并选择合适的计算器

**接口**：
```javascript
class CalculatorFactory {
  static createCalculator(config) // 创建计算器
  static registerCalculator(type, CalculatorClass) // 注册新类型
  static getSupportedTypes() // 获取支持的类型列表
}
```

### 3.2 配置加载器（ConfigLoader）

**位置**：`config/config-loader.js`

**职责**：
- 加载指定游戏的配置（优先合并用户自定义参数）
- 加载原始配置（不含自定义）
- 加载所有游戏配置

**接口**：
```javascript
function loadGameConfig(gameId) // 加载游戏配置（含自定义）
function loadOriginalGameConfig(gameId) // 加载原始配置
function loadAllGames() // 加载所有游戏
```

**自定义规则合并逻辑**：
```
基础配置 + 用户自定义设置 ──▶ 合并配置
  (games/)     (storage)         (runtime)
```

### 3.3 配置验证器（ConfigValidator）

**位置**：`core/config/config-validator.js`

**职责**：
- 验证必填字段存在
- 验证字段类型正确
- 验证数值在合理范围内
- 验证逻辑一致性

**验证规则**：
| 参数 | 范围 | 说明 |
|------|------|------|
| baseRate | 0.001 - 1.0 | 基础概率 |
| hardPity.count | 1 - 1000 | 硬保底抽数 |
| softPity.start | 1 - hardPity | 软保底起始 |
| guarantee.rate | 0.01 - 1.0 | 小保底UP率 |

### 3.4 存储服务（StorageService）

**位置**：`services/storage-service.js`

**职责**：
- 用户数据的持久化读写
- 数据版本迁移
- 智能缓存管理

**数据模型**：
```javascript
{
  version: '1.0.0',
  currentGameId: 'genshin',
  updatedAt: '2026-04-19T...',
  games: {
    genshin: {
      primogems: 10000,
      intertwinedFates: 80,
      currentPity: 10
    },
    starrail: { ... }
  },
  customRules: { ... },
  history: { ... }
}
```

### 3.5 游戏服务（GameService）

**位置**：`services/game-service.js`

**职责**：
- 游戏切换逻辑
- 当前游戏资源管理
- 支持的游戏列表查询

**状态管理**：
```javascript
class GameService {
  currentGameId: string  // 当前游戏ID
  
  switchGame(gameId)     // 切换游戏（自动保存/加载资源）
  getCurrentResources()  // 获取当前游戏资源
  updateResources(data)  // 更新资源
  getSupportedGames()    // 获取支持的游戏列表
}
```

## 4. 配置架构

### 4.1 配置模板结构

```javascript
{
  gameId: '',           // 游戏唯一标识
  name: '',             // 游戏名称
  pityType: 'none',     // 保底类型
  baseRate: 0.01,       // 基础概率
  
  hardPity: { enabled, count, resetOnSuccess },
  softPity: { enabled, start, increment, maxRate },
  guarantee: { enabled, rate, captureLight, captureLightRate },
  luckValue: { enabled, maxValue, incrementPerPull, ratePerLuck, guaranteeAtMax },
  multiPool: { enabled, sharedPity, pools },
  pityInheritance: { enabled, crossPool, expirationDays },
  
  resources: { primary, secondary },
  conversionRate: { primaryToPull },
  metadata: { developer, officialUrl, description, tags }
}
```

### 4.2 预设模板映射

| 模板ID | 适用游戏 | 核心机制 |
|--------|----------|----------|
| mihoyo | 原神、崩铁、绝区零 | 硬保底+软保底+大小保底 |
| arknights | 明日方舟 | 软保底 |
| fgo | FGO、碧蓝航线 | 无保底 |
| hok | 王者荣耀 | 幸运值 |
| onmyoji | 阴阳师 | 多池联动 |

## 5. 数据流架构

### 5.1 概率计算流程

```
用户输入资源 ──▶ 页面(Page) ──▶ GameService.getCurrentResources()
                                     │
                                     ▼
                              ConfigLoader.loadGameConfig()
                                     │
                                     ▼
                              CalculatorFactory.createCalculator()
                                     │
                                     ▼
                              Calculator.calculateProbabilityDistribution()
                                     │
                                     ▼
                              页面 setData() ──▶ 组件渲染
```

### 5.2 数据保存流程

```
用户修改 ──▶ 页面(Page) ──▶ GameService.updateResources()
                                │
                                ▼
                         StorageService.updateResources()
                                │
                                ▼
                         wx.setStorageSync() + 缓存更新
```

### 5.3 配置加载流程

```
小程序启动 ──▶ App.onLaunch() ──▶ ConfigLoader.loadAllGames()
                                      │
                                      ▼
                              遍历每个游戏 ──▶ ConfigLoader.loadGameConfig()
                                                  │
                                                  ├─▶ 加载基础配置
                                                  └─▶ 合并用户自定义规则
                                                        │
                                                        ▼
                                                  ConfigValidator.validateConfig()
```

## 6. 组件架构

### 6.1 组件通信模式

```
父组件 ──properties──▶ 子组件
子组件 ──triggerEvent──▶ 父组件

跨组件通信：通过 Service 层或全局数据
```

### 6.2 关键组件接口

**probability-chart 组件**：
```javascript
properties: {
  distribution: Array,      // 概率分布数据
  currentPulls: Number,     // 当前抽数
  probabilityTimeline: Array // 动态概率时间线（可选）
}
```

**resource-input 组件**：
```javascript
properties: {
  resources: Object,        // 当前资源
  gameConfig: Object        // 游戏配置（用于显示资源名称）
}
events: {
  change: { resources }     // 资源变化时触发
}
```

## 7. 测试架构

### 7.1 测试目录结构

```
tests/
├── core/
│   ├── calculator/         # 计算器单元测试
│   └── suggestion/         # 建议生成测试
├── services/               # 服务层测试
├── components/             # 组件测试
├── config/                 # 配置验证测试
└── integration/            # 集成测试
```

### 7.2 测试策略

- **单元测试**：每个计算器独立的数学准确性测试
- **集成测试**：服务层与存储层的交互测试
- **配置测试**：所有预设配置的合法性验证

### 7.3 关键测试指标

- 概率计算准确度 > 95%
- 配置验证覆盖率 100%
- 存储服务状态一致性

## 8. 扩展点

### 8.1 添加新计算器

1. 在 `core/calculator/` 创建新文件
2. 继承 `BaseCalculator`
3. 实现 `calculateProbabilityDistribution()` 和 `calculateSingleProbability()`
4. 在 `CalculatorFactory` 注册

### 8.2 添加新页面

1. 在 `pages/` 创建目录（包含 .js .wxml .wxss .json）
2. 在 `app.json` 的 `pages` 数组注册
3. 如需 Tab 入口，在 `app.json` 的 `tabBar.list` 配置

### 8.3 添加新游戏配置

1. 在 `config/games/` 创建配置文件
2. 使用 `createGameConfig(template, options)` 或手动编写
3. 运行验证确保配置合法

## 9. 部署与构建

### 9.1 开发环境
- 微信开发者工具
- Node.js（用于 Jest 测试）

### 9.2 构建流程
```bash
npm test        # 运行 Jest 测试
# 微信小程序无需额外构建，直接在微信开发者工具中预览
```

### 9.3 发布流程
1. 在微信开发者工具中上传代码
2. 在小程序后台提交审核
3. 审核通过后发布
