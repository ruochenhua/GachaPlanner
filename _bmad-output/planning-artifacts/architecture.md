---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-gachaplaner.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/research/market-gacha-planner-research-2026-03-31.md'
workflowType: 'architecture'
project_name: 'GachaPlaner'
user_name: 'Waston'
date: '2026-04-04'
status: 'complete'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## 项目上下文分析

### 需求概览

**功能需求分析：**

从PRD中提取了54个功能需求，组织为以下核心模块：

1. **游戏管理模块** (FR1-FR9)
   - 多游戏统一管理（原神、星铁、明日方舟等）
   - 游戏切换、资源总览
   - 当前资源输入与编辑
   - 数据本地持久化

2. **卡池规划与计算模块** (FR10-FR22)
   - 单卡池概率计算
   - 多卡池连续规划（核心功能）
   - 基于官方概率公式的准确计算
   - 支持硬保底、软保底机制
   - 智能建议生成（达成概率、资源预估、建议行动）

3. **数据可视化模块** (FR23-FR26)
   - 概率分布图表
   - 资源消耗曲线
   - 图表渲染性能 < 500ms

4. **智能建议生成模块** (FR27-FR30)
   - 文字建议生成
   - 优先级建议
   - 风险提示
   - 策略调整建议

5. **历史数据管理模块** (FR31-FR37)
   - 抽卡历史记录
   - 规划准确度验证
   - 历史数据趋势分析

6. **自定义游戏模板架构** (FR38-FR44)
   - 配置驱动架构设计
   - 支持不同保底机制
   - 游戏数据与计算逻辑分离

7. **游戏数据管理模块** (FR45-FR48)
   - 手动更新游戏配置
   - 数据版本管理

8. **扩展功能** (FR49-FR54, Post-MVP)
   - 分享功能
   - 推送通知

**非功能需求分析：**

从PRD中提取了34个非功能需求，关键架构约束：

**性能要求：**
- NFR1: 单次概率计算响应 < 100ms
- NFR2: 多卡池连续规划计算 < 500ms（最多10个卡池）
- NFR3: 概率计算准确度 > 95%
- NFR4: 图表渲染响应 < 500ms
- NFR5: 概率分布图表渲染帧率 > 30fps
- NFR6: 列表滚动流畅度 > 50fps
- NFR7: 本地存储读写 < 50ms
- NFR8: 数据持久化不阻塞UI
- NFR9: 小程序冷启动 < 3秒
- NFR10: 小程序热启动 < 1秒

**可靠性要求：**
- NFR11: 本地存储数据持久化成功率 > 99.9%
- NFR12: 小程序异常退出时数据不丢失
- NFR13: 数据存储完整性校验
- NFR14: 概率计算结果一致性
- NFR15: 保底机制计算准确性
- NFR16: 多卡池资源分配计算正确性
- NFR17: 无闪退、白屏、卡死
- NFR18: 异常输入处理
- NFR19: 边界条件处理

**数据安全要求：**
- NFR20: 用户数据仅存储在微信小程序安全沙箱
- NFR21: 其他程序无法读取本地存储
- NFR22: 敏感数据不泄露到日志或控制台
- NFR23: 不收集用户个人信息
- NFR24: 不上传用户数据到外部服务器
- NFR25: 用户可随时清除所有本地数据
- NFR26: 数据版本管理
- NFR27: 数据格式校验
- NFR28: 数据迁移兼容性

**用户体验质量：**
- NFR29: 核心操作路径 ≤ 3步
- NFR30: 界面响应反馈 < 100ms
- NFR31: 错误提示清晰明确

**可维护性：**
- NFR32: 游戏配置数据与计算逻辑分离
- NFR33: 自定义游戏模板架构可扩展
- NFR34: 代码可读性与模块化

**规模与复杂度：**

- **项目复杂度**：中等
- **主要技术领域**：移动端前端（微信小程序）+ 本地数据管理 + 概率计算引擎
- **预估架构组件**：
  - 核心计算引擎模块
  - 游戏配置管理模块
  - 数据持久化模块
  - UI组件库（6个自定义组件 + Vant Weapp）
  - 图表渲染模块

### 技术约束与依赖

**已知约束：**

1. **平台约束**
   - 微信小程序包体积限制：2MB主包（预估1MB，安全）
   - 本地存储限制：10MB上限（纯文本数据，充足）
   - 渲染性能：Canvas图表渲染 < 500ms
   - 无服务器依赖（MVP阶段）

2. **性能约束**
   - 概率计算响应 < 500ms
   - 图表渲染流畅（> 30fps）
   - 冷启动 < 3秒

3. **数据约束**
   - 完全本地运行，无服务器成本
   - 数据安全：本地沙箱存储
   - 无用户个人信息收集

**技术依赖：**

1. **核心框架**
   - 微信小程序原生框架
   - 微信小程序API（本地存储、Canvas、分享）

2. **UI组件库**
   - Vant Weapp组件库
   - 6个自定义组件

3. **数据可视化**
   - wx-charts（轻量级图表库）
   - 或Canvas API自绘

4. **开发工具**
   - 微信开发者工具
   - AI代码生成（目标 > 90%）

### 跨切面关注点识别

从PRD和UX规范中识别出以下跨切面关注点，将影响多个架构组件：

1. **数据持久化**
   - 影响：所有模块需与本地存储交互
   - 要求：自动保存、数据版本管理、迁移兼容
   - 架构决策：统一的数据持久化服务层

2. **即时计算**
   - 影响：输入变化即重新计算，影响多个页面
   - 要求：响应 < 500ms、结果一致、计算准确
   - 架构决策：响应"输入即计算"的响应式架构

3. **性能优化**
   - 影响：计算响应、图表渲染、启动速度
   - 要求：计算 < 100ms、渲染 < 500ms、冷启动 < 3s
   - 架构决策：计算引擎优化、图表渲染优化、启动优化

4. **可扩展性**
   - 影响：自定义游戏模板、配置驱动架构
   - 要求：快速接入新游戏、支持不同保底机制
   - 架构决策：配置驱动的游戏引擎架构

5. **数据准确性**
   - 影响：概率计算引擎、数据版本管理
   - 要求：准确度 > 95%、符合官方公式、结果可验证
   - 架构决策：基于官方公式的计算引擎、数据版本标注

6. **用户体验一致性**
   - 影响：莫兰迪暖色系、组件规范、交互模式
   - 要求：视觉一致、交互流畅、响应即时
   - 架构决策：统一设计令牌系统、组件库规范

### 架构关键挑战

基于需求分析，识别出以下关键架构挑战：

**挑战1：概率计算引擎设计**

- **问题描述**：需支持多种游戏的保底机制（硬保底、软保底、无保底）
- **架构影响**：计算引擎需抽象保底机制，配置驱动
- **解决方案方向**：
  - 定义统一的概率计算接口
  - 不同保底机制实现为策略类
  - 游戏配置包含保底类型和参数

**挑战2：配置驱动架构**

- **问题描述**：游戏数据与计算逻辑分离，支持快速接入新游戏
- **架构影响**：需设计灵活的配置结构和加载机制
- **解决方案方向**：
  - 游戏配置JSON格式定义
  - 配置加载与验证机制
  - 自定义模板扩展接口

**挑战3：即时反馈性能**

- **问题描述**：输入即计算，响应 < 500ms
- **架构影响**：需优化计算性能，避免阻塞UI
- **解决方案方向**：
  - 计算引擎性能优化
  - 防抖/节流机制
  - 异步计算（如需）

**挑战4：数据可靠性**

- **问题描述**：本地存储无数据丢失，自动持久化
- **架构影响**：需设计可靠的数据持久化机制
- **解决方案方向**：
  - 统一数据持久化服务
  - 自动保存机制
  - 数据完整性校验
  - 异常恢复机制

**挑战5：图表渲染性能**

- **问题描述**：Canvas图表动态更新，渲染 < 500ms
- **架构影响**：需选择合适的图表库或自绘方案
- **解决方案方向**：
  - wx-charts轻量级方案
  - 或Canvas自绘优化
  - 图表数据点限制
  - 渲染缓存机制

## Starter Template评估

### 主要技术领域

**微信小程序原生开发** - 基于项目需求分析确定

GachaPlaner是微信小程序项目，使用微信小程序原生框架开发。与Web应用不同，微信小程序没有丰富的starter template生态，项目通过**微信开发者工具**直接创建。

### 技术栈已确定

从PRD和UX规范中提取的技术决策：

**已确定的技术栈：**
- **平台**：微信小程序
- **框架**：微信小程序原生框架
- **UI组件库**：Vant Weapp
- **图表方案**：wx-charts或Canvas API自绘
- **数据存储**：微信小程序本地存储API
- **开发工具**：微信开发者工具
- **语言**：JavaScript（微信小程序原生支持）

### 项目初始化方式

**微信小程序项目创建流程：**

1. **创建项目**
   - 微信开发者工具 → 新建项目
   - 选择"快速启动模板"或"空项目"
   - 获得基础项目结构

2. **安装依赖**
   ```bash
   npm init
   npm i @vant/weapp -S --production
   ```

3. **构建npm**
   - 微信开发者工具 → 工具 → 构建npm
   - 生成miniprogram_npm目录

4. **配置项目**
   - 修改app.json配置tabBar、window等
   - 配置project.config.json项目设置

### 项目结构设计

**GachaPlaner自定义项目结构：**

```
GachaPlaner/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json          # 站点地图
│
├── pages/                 # 页面目录
│   ├── index/            # 首页（资源总览）
│   ├── planning/         # 规划计算页
│   ├── history/          # 历史记录页
│   └── profile/          # 个人中心页
│
├── components/            # 自定义组件
│   ├── overview-card/    # 总览卡片
│   ├── game-card/        # 游戏卡片
│   ├── timeline/         # 时间轴
│   ├── probability-display/  # 概率展示
│   ├── probability-chart/    # 概率图表
│   └── suggestion-card/      # 建议卡片
│
├── core/                  # 核心引擎模块
│   ├── calculator/       # 概率计算引擎
│   │   ├── base-calculator.js    # 基础计算器
│   │   ├── hard-pity.js          # 硬保底策略
│   │   ├── soft-pity.js          # 软保底策略
│   │   └── calculator-factory.js # 计算器工厂
│   │
│   ├── suggestion/       # 智能建议引擎
│   │   └── suggestion-generator.js
│   │
│   └── validator/        # 数据验证器
│       └── data-validator.js
│
├── config/                # 游戏配置模块
│   ├── games/            # 游戏数据配置
│   │   ├── genshin.json  # 原神配置
│   │   ├── starrail.json # 星铁配置
│   │   └── arknights.json # 明日方舟配置
│   │
│   ├── config-loader.js  # 配置加载器
│   └── config-validator.js # 配置验证器
│
├── services/              # 服务层
│   ├── storage-service.js    # 数据持久化服务
│   ├── game-service.js       # 游戏管理服务
│   └── history-service.js    # 历史记录服务
│
├── utils/                 # 工具函数
│   ├── util.js           # 通用工具
│   ├── debounce.js       # 防抖函数
│   └── number-format.js  # 数字格式化
│
├── assets/                # 静态资源
│   ├── images/           # 图片资源
│   │   ├── games/       # 游戏图标
│   │   └── icons/       # UI图标
│   └── fonts/            # 字体文件
│
├── styles/                # 全局样式
│   ├── variables.wxss    # CSS变量（设计令牌）
│   ├── theme.wxss        # 主题样式
│   └── common.wxss       # 通用样式
│
└── miniprogram_npm/      # npm包（Vant Weapp等）
```

### 架构设计原则

**模块化组织：**
- `core/` - 核心计算引擎，独立于UI，纯逻辑模块
- `config/` - 游戏配置数据，配置驱动架构
- `services/` - 业务服务层，统一数据访问接口
- `components/` - UI组件，高度复用

**配置驱动架构：**
- 游戏配置独立于代码（JSON格式）
- 配置加载器动态加载游戏数据
- 支持快速接入新游戏，无需修改代码

**计算引擎抽象：**
- 不同保底机制实现为策略类（Strategy Pattern）
- 计算器工厂根据游戏类型创建计算器
- 易于扩展新的保底机制

**数据持久化统一：**
- `storage-service.js`统一管理本地存储
- 自动保存机制、数据版本管理
- 所有模块通过服务层访问数据

**UI组件复用：**
- 6个自定义组件独立封装
- 遵循Vant Weapp设计语言
- 通过CSS变量继承设计令牌

### 架构决策已提供

**通过项目结构设计确立的架构决策：**

**语言与运行时：**
- JavaScript（微信小程序原生）
- 无TypeScript（简化开发，AI生成友好）

**UI组件库：**
- Vant Weapp作为基础组件库
- 6个自定义组件满足特定需求
- CSS变量系统实现设计令牌

**项目结构：**
- 模块化组织，职责清晰
- 核心逻辑与UI分离
- 配置数据独立管理

**配置驱动：**
- 游戏配置JSON格式
- 配置加载器动态加载
- 支持自定义游戏模板

**计算引擎：**
- 策略模式实现不同保底机制
- 计算器工厂创建计算器实例
- 纯函数，易于测试

**数据持久化：**
- 统一服务层
- 自动保存机制
- 数据版本管理

**样式系统：**
- CSS变量设计令牌
- 莫兰迪暖色系主题
- 响应式布局支持

**开发工作流：**
- 微信开发者工具开发
- npm管理第三方依赖
- AI生成代码为主

### 初始化步骤

**项目初始化清单：**

1. **创建微信小程序项目**
   - 微信开发者工具新建项目
   - 选择"快速启动模板"
   - AppID：测试号或正式AppID

2. **安装Vant Weapp**
   ```bash
   npm init
   npm i @vant/weapp -S --production
   ```

3. **构建npm**
   - 微信开发者工具 → 工具 → 构建npm

4. **创建项目目录结构**
   - 创建pages、components、core、config、services、utils、assets、styles目录
   - 创建核心文件骨架

5. **配置app.json**
   - 配置pages页面路由
   - 配置tabBar底部导航
   - 配置window窗口样式

6. **配置CSS变量**
   - 创建styles/variables.wxss
   - 定义莫兰迪暖色系设计令牌

7. **配置游戏数据**
   - 创建config/games/目录
   - 编写原神、星铁游戏配置JSON

**注意：** 项目初始化应作为第一个实现故事。

### 项目初始化命令

```bash
# 微信小程序通过GUI创建，无CLI命令
# 初始化后执行以下命令安装依赖

npm init -y
npm i @vant/weapp -S --production

# 微信开发者工具中构建npm
# 工具 → 构建npm
```

### 包体积评估

**预估包体积：**
- 微信小程序框架基础：~500KB
- Vant Weapp组件库：~100KB（按需引入）
- 自定义代码：~200KB
- 游戏配置数据：~50KB
- 图片资源：~100KB（压缩后）

**总计：约950KB**，远低于2MB主包限制，安全。

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- 数据建模方法：扁平化JSON结构
- 数据验证策略：分层验证（服务层验证完整性，计算引擎验证业务规则）
- 模块间通信模式：服务层中介模式
- 响应式更新机制：微信小程序data绑定 + 防抖触发计算
- 状态管理方法：全局app.js数据 + 服务层辅助

**Important Decisions (Shape Architecture):**
- 数据迁移与版本管理：版本号检测 + 迁移函数
- 内存缓存策略：智能缓存（热点数据常驻内存，冷数据按需加载）
- 错误处理标准：Result模式（返回值包装）
- 组件通信模式：属性传递 + 事件触发
- 性能优化策略：计算缓存 + 图表数据点限制 + 列表虚拟滚动 + 防抖节流

**Deferred Decisions (Post-MVP):**
- 多环境配置（开发、测试、生产环境区分）
- 第三方监控服务接入
- 数据云同步架构

### Data Architecture

**数据建模方法**
- **决策**：扁平化JSON结构
- **理由**：微信小程序本地存储API天然适合JSON；扁平化结构读写简单，性能好；数据量不大，无需复杂关系模型；易于AI生成代码理解和维护
- **影响**：所有数据存储和读取逻辑
- **示例**：
```javascript
// 游戏配置数据
{
  "gameId": "genshin",
  "name": "原神",
  "pityType": "hard",
  "hardPity": 90,
  "softPityStart": 74,
  "baseRate": 0.006
}

// 用户资源数据
{
  "currentGameId": "genshin",
  "games": {
    "genshin": {
      "primogems": 10000,
      "intertwinedFates": 80,
      "currentPity": 0
    }
  },
  "version": "1.0.0"
}
```

**数据验证策略**
- **决策**：分层验证
  - 服务层验证数据完整性（必填字段、数据类型、格式校验）
  - 计算引擎验证业务规则（保底范围、资源数量合理性）
  - UI层不做验证，只做输入格式化
- **理由**：职责清晰，服务层把关数据质量，计算引擎保证业务逻辑正确
- **影响**：core/validator/、services/storage-service.js
- **实现**：
```javascript
// services/storage-service.js - 服务层验证
validateGameData(data) {
  if (!data.gameId || typeof data.primogems !== 'number') {
    return error('数据格式错误：缺少必填字段或类型不正确');
  }
  return success(data);
}

// core/validator/data-validator.js - 计算引擎验证
validateBusinessRules(resources, target) {
  if (resources.primogems < 0) {
    return error('资源数量不能为负数');
  }
  if (target.pity > 90) {
    return error('保底值超出范围');
  }
  return success();
}
```

**数据迁移与版本管理**
- **决策**：版本号检测 + 迁移函数
- **实现**：
  - CURRENT_VERSION常量标识当前数据版本（如'1.0.0'）
  - migrateData()函数检测版本并执行迁移
  - 启动时自动迁移（app.js onLaunch）
- **理由**：数据结构升级不可避免；版本号清晰标识，避免混乱；迁移函数保证平滑升级
- **影响**：services/storage-service.js、app.js
- **实现示例**：
```javascript
// services/storage-service.js
const CURRENT_VERSION = '1.0.0';

migrateData(data) {
  const version = data.version || '0.0.0';

  // 0.x.x → 1.0.0 迁移
  if (version.startsWith('0.')) {
    data = this.migrate_0_to_1(data);
  }

  data.version = CURRENT_VERSION;
  return data;
}

migrate_0_to_1(data) {
  // 示例：新增字段默认值
  if (!data.games) {
    data.games = {};
  }
  return data;
}
```

**内存缓存策略**
- **决策**：智能缓存
  - 热点数据常驻内存：当前游戏资源数据、游戏配置数据
  - 冷数据按需加载：历史记录
  - 缓存更新同步到本地存储
- **理由**：平衡内存占用和性能；避免全量缓存占用过多内存；满足性能要求（存储读写<50ms）
- **影响**：services/storage-service.js缓存机制
- **实现**：
```javascript
// services/storage-service.js
class StorageService {
  constructor() {
    this.cache = {
      currentGame: null,      // 当前游戏数据（常驻）
      currentGameId: null,    // 当前游戏ID
      gamesConfig: null       // 游戏配置（常驻）
    };
  }

  loadCurrentGameResources(gameId) {
    if (this.cache.currentGameId === gameId && this.cache.currentGame) {
      return success(this.cache.currentGame); // 缓存命中
    }

    const data = wx.getStorageSync('user_data');
    const gameData = data.games[gameId];

    this.cache.currentGame = gameData;
    this.cache.currentGameId = gameId;

    return success(gameData);
  }

  updateResources(gameId, resources) {
    this.cache.currentGame = resources;

    const data = wx.getStorageSync('user_data');
    data.games[gameId] = resources;
    wx.setStorageSync('user_data', data);
  }

  loadHistory() {
    return success(wx.getStorageSync('history')); // 不缓存
  }
}
```

### Authentication & Security

**认证方法**
- **决策**：MVP无认证（无登录、无手机号、无微信授权）
- **理由**：PRD明确要求；降低使用门槛；所有数据本地存储，无需用户身份
- **影响**：无需实现认证模块

**数据安全策略**
- **决策**：
  - 微信小程序沙箱存储安全机制（天然隔离，自动加密）
  - 敏感数据不泄露到console.log和日志
  - 提供"清除所有数据"功能（二次确认，不可恢复）
- **理由**：符合NFR20-28数据安全要求；尊重用户数据控制权
- **影响**：services/storage-service.js clearAllData()方法、开发规范
- **实现**：
```javascript
// services/storage-service.js
clearAllData() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有游戏数据、规划记录和历史记录，此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.cache = { currentGame: null, currentGameId: null };
          resolve(success(true));
        } else {
          resolve(success(false));
        }
      }
    });
  });
}
```

### API & Communication Patterns

**模块间通信模式**
- **决策**：服务层中介模式
  - pages调用services获取数据和服务
  - services调用core计算引擎执行计算
  - core不直接与pages交互
- **理由**：清晰的分层架构，职责明确，易于AI理解和维护
- **影响**：所有模块间的调用关系
- **架构图**：
```
pages (UI层)
  ↓ 调用
services (业务服务层)
  ↓ 调用
core (计算引擎层)
```
- **实现示例**：
```javascript
// pages/planning/planning.js
const gameService = require('../../services/game-service');
const calculator = require('../../core/calculator/calculator-factory');

Page({
  onLoad() {
    const result = gameService.getCurrentResources();
    if (result.success) {
      const calcResult = calculator.calculate(gameId, result.data, target);
      this.setData({ result: calcResult.data });
    }
  }
});

// services/game-service.js
getCurrentResources() {
  return storageService.loadCurrentGameResources(this.currentGameId);
}
```

**错误处理标准**
- **决策**：Result模式（返回值包装）
  - 统一返回格式：`{success: boolean, data?: any, error?: string}`
  - 成功：`success(data)`
  - 失败：`error(message)`
- **理由**：简单直接；调用方易于处理；适合JavaScript环境；易于AI生成代码理解
- **影响**：utils/result.js、所有服务层和计算引擎返回值
- **实现**：
```javascript
// utils/result.js
function success(data) {
  return { success: true, data };
}

function error(message) {
  return { success: false, error: message };
}

// 使用示例
const result = storageService.loadCurrentGameResources('genshin');
if (result.success) {
  this.setData({ resources: result.data });
} else {
  wx.showToast({ title: result.error, icon: 'none' });
}
```

**响应式更新机制**
- **决策**：微信小程序data绑定 + 防抖触发计算
  - 利用微信小程序原生data绑定机制
  - 输入变化300ms防抖后触发计算
  - setData触发页面重新渲染
- **理由**：利用小程序原生能力；简单高效；避免频繁计算
- **影响**：所有输入页面、utils/debounce.js
- **实现**：
```javascript
// utils/debounce.js
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// pages/planning/planning.js
Page({
  onLoad() {
    this.debouncedCalculate = debounce(this.calculate.bind(this), 300);
  },

  onResourcesChange(e) {
    const primogems = parseInt(e.detail.value);
    this.setData({ 'resources.primogems': primogems });
    this.debouncedCalculate();
  },

  calculate() {
    const { resources, target } = this.data;
    const result = calculator.calculate(resources, target);
    this.setData({ result: result.data });
  }
});
```

### Frontend Architecture

**状态管理方法**
- **决策**：全局app.js数据 + 服务层辅助
  - app.globalData存储全局状态（currentGameId、games）
  - 服务层提供数据读取和更新方法
  - pages通过getApp()或services访问数据
- **理由**：微信小程序原生方案；简单直接；无需额外状态管理库
- **影响**：app.js、services/game-service.js
- **实现**：
```javascript
// app.js
App({
  globalData: {
    currentGameId: 'genshin',
    games: {}
  },

  onLaunch() {
    const storageService = require('./services/storage-service');
    const result = storageService.load();
    if (result.success) {
      this.globalData = result.data;
    }
  }
});

// services/game-service.js
const app = getApp();

getCurrentResources() {
  return success(app.globalData.games[app.globalData.currentGameId]);
}

updateResources(resources) {
  app.globalData.games[app.globalData.currentGameId] = resources;
  storageService.save(app.globalData);
}
```

**组件通信模式**
- **决策**：属性传递 + 事件触发（微信小程序原生）
  - 父子组件：properties传递数据，triggerEvent触发事件
  - 兄弟组件：状态提升到父页面协调
- **理由**：微信小程序原生机制；无需额外复杂性；保持简单
- **影响**：所有自定义组件
- **实现**：
```javascript
// components/probability-display/probability-display.js
Component({
  properties: {
    probability: { type: Number, value: 0 }
  },

  methods: {
    onTap() {
      this.triggerEvent('detail', { probability: this.data.probability });
    }
  }
});

// pages/planning/planning.wxml
<probability-display
  probability="{{result.probability}}"
  bind:detail="onProbabilityDetail"
/>
```

**性能优化策略**
- **决策**：
  - 计算引擎优化：预计算缓存、增量计算、算法优化
  - 图表渲染优化：数据点限制100个、渲染缓存、wx-charts轻量级库
  - 列表虚拟滚动：历史记录使用recycle-view或wx:for优化
  - 防抖节流：输入300ms防抖，图表渲染100ms节流
- **理由**：满足性能要求（计算<100ms，渲染<500ms，列表>50fps）
- **影响**：core/calculator/缓存机制、components/probability-chart/、pages/history/
- **实现**：
```javascript
// core/calculator/base-calculator.js
class BaseCalculator {
  constructor() {
    this.cache = new Map();
  }

  calculate(resources, target) {
    const key = `${resources.primogems}-${target.pity}`;

    if (this.cache.has(key)) {
      return success(this.cache.get(key));
    }

    const result = this._calculateInternal(resources, target);
    this.cache.set(key, result);
    return success(result);
  }
}

// components/probability-chart/probability-chart.js
Component({
  observers: {
    'distribution.**': function(newVal) {
      if (this.renderTimer) return;

      this.renderTimer = setTimeout(() => {
        this.renderChart(newVal);
        this.renderTimer = null;
      }, 100);
    }
  }
});
```

### Infrastructure & Deployment

**部署流程**
- **决策**：微信小程序标准部署流程
  - 微信开发者工具上传代码
  - 提交审核（微信团队审核）
  - 审核通过后发布上线
- **理由**：微信小程序平台规定流程
- **影响**：项目发布流程

**环境配置**
- **决策**：单环境配置（MVP阶段）
  - 开发版：本地调试
  - 体验版：邀请测试用户
  - 正式版：正式上线
  - project.config.json配置单个环境
- **理由**：MVP快速上线；微信开发者工具提供三种版本；无需多环境区分
- **影响**：project.config.json配置

**监控与日志**
- **决策**：微信小程序自带日志 + 自定义错误捕获
  - wx.getLogManager()记录运行日志
  - 全局错误捕获wx.onError()
  - 生产环境不console.log用户数据
- **理由**：简单实现；无需第三方服务；MVP快速上线
- **影响**：app.js日志初始化、全局错误处理
- **实现**：
```javascript
// app.js
App({
  onLaunch() {
    this.logger = wx.getLogManager({ level: 1 });

    wx.onError((error) => {
      this.logger.log('全局错误', error);
    });
  },

  log(message, data) {
    this.logger.log(message, data);
  }
});
```

### Decision Impact Analysis

**Implementation Sequence:**
1. 项目初始化（微信开发者工具创建项目）
2. 安装依赖（Vant Weapp、wx-charts）
3. 创建项目目录结构
4. 实现utils/工具模块（result.js、debounce.js）
5. 实现core/计算引擎（calculator、validator）
6. 实现config/游戏配置（genshin.json、starrail.json）
7. 实现services/服务层（storage-service、game-service）
8. 实现components/自定义组件
9. 实现pages/页面
10. 配置app.js全局状态和日志
11. 测试和优化

**Cross-Component Dependencies:**
- 数据架构决策影响所有模块的数据结构设计
- Result模式影响所有服务层和计算引擎的返回值格式
- 服务层中介模式决定模块间调用关系
- 性能优化策略影响计算引擎和图表组件的实现
- 响应式更新机制影响所有输入页面的交互逻辑

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
- 5大类、20+个潜在冲突点，已全部定义统一模式
- 涵盖命名、结构、格式、通信、流程五个维度
- 确保所有AI agents遵循相同规范，避免实现冲突

### Naming Patterns

**文件命名规范：**
- **规则**：小写中划线（kebab-case）
- **理由**：微信小程序惯例，与Vant Weapp风格一致
- **示例**：
  - `services/game-service.js`
  - `core/calculator/base-calculator.js`
  - `utils/number-format.js`

**组件命名规范：**
- **规则**：小写中划线（kebab-case）
- **理由**：微信小程序组件文件夹惯例
- **示例**：
  - `components/probability-display/`
  - `components/overview-card/`
  - `components/game-card/`

**变量命名规范：**
- **规则**：camelCase（小驼峰）
- **理由**：JavaScript标准惯例，易于AI理解和生成
- **示例**：
  - `const currentGameId = 'genshin';`
  - `const primogems = 10000;`
  - `const probabilityResult = calculator.calculate();`

**JSON字段命名规范：**
- **规则**：camelCase（小驼峰）
- **理由**：与JavaScript变量命名一致，减少转换，易于理解
- **示例**：
```json
{
  "primogems": 10000,
  "intertwinedFates": 80,
  "currentPity": 0,
  "hardPity": 90
}
```

### Structure Patterns

**测试文件位置：**
- **规则**：MVP阶段不写测试文件
- **理由**：快速开发，AI生成代码为主，后期补充测试
- **影响**：无需创建`**tests**`目录

**工具函数组织：**
- **规则**：`utils/`统一目录，集中管理
- **理由**：易于复用和查找，AI易于理解结构
- **示例**：
```
utils/
  ├── result.js          # Result模式工具
  ├── debounce.js        # 防抖函数
  └── number-format.js   # 数字格式化
```

**配置文件组织：**
- **规则**：`config/games/`子目录，游戏数据独立管理
- **理由**：已确定，配置驱动架构，游戏数据与代码分离
- **示例**：
```
config/games/
  ├── genshin.json       # 原神配置
  ├── starrail.json      # 星铁配置
  └── arknights.json     # 明日方舟配置
```

**静态资源组织：**
- **规则**：`assets/images/`按类型分类（games/、icons/）
- **理由**：清晰分类，易于扩展新游戏和图标
- **示例**：
```
assets/images/
  ├── games/             # 游戏图标
  │   ├── genshin.png
  │   ├── starrail.png
  │   └── arknights.png
  └── icons/             # UI图标
      ├── warning.png
      └── success.png
```

### Format Patterns

**错误消息格式：**
- **规则**：用户友好信息，避免技术细节
- **理由**：符合NFR31错误提示清晰明确，不暴露技术实现
- **示例**：
```javascript
// 正确：用户友好
return error('数据加载失败，请重新打开小程序');

// 错误：技术细节暴露
return error('TypeError: Cannot read property at line 45');
```

**日期时间格式：**
- **规则**：微信小程序相对时间显示（"刚刚"、"3小时前"、"2天前"）
- **理由**：用户体验友好，符合微信风格，历史记录更易理解
- **实现**：
```javascript
// utils/time-format.js
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff/60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}小时前`;
  return `${Math.floor(diff/86400000)}天前`;
}

// 使用
const displayTime = formatRelativeTime(record.timestamp);
```

**数字格式：**
- **规则**：存储原始数字，显示时千分位格式化
- **理由**：存储简单，显示优化，易于计算和展示
- **实现**：
```javascript
// utils/number-format.js
function formatNumber(num) {
  return num.toLocaleString('zh-CN'); // 10000 → 10,000
}

// 存储：原始数字
{ primogems: 10000 }

// 显示：格式化
<text>{{formatNumber(resources.primogems)}}</text>
// 显示：10,000
```

### Communication Patterns

**事件命名规范：**
- **规则**：camelCase（小驼峰）
- **理由**：JavaScript事件惯例，易于理解，符合微信小程序风格
- **示例**：
```javascript
// 正确：小驼峰
this.triggerEvent('resourceChange', { value: 100 });
this.triggerEvent('gameSwitch', { gameId: 'genshin' });

// 错误：其他格式
this.triggerEvent('resource-change', data); // 小写中划线
this.triggerEvent('ResourceChange', data);  // 大驼峰
```

**事件payload结构：**
- **规则**：对象包装 `{value, ...}`
- **理由**：结构清晰，易于扩展，符合微信组件惯例
- **示例**：
```javascript
// 正确：对象包装
this.triggerEvent('resourceChange', {
  value: 100,
  type: 'primogems'
});

// 错误：直接传递值
this.triggerEvent('resourceChange', 100); // 不易扩展
```

**setData调用模式：**
- **规则**：路径更新，减少数据传输量
- **理由**：性能优化，避免完整数据对象重新渲染
- **示例**：
```javascript
// 正确：路径更新
this.setData({ 'resources.primogems': 100 });
this.setData({ 'result.probability': 0.65 });

// 错误：多次完整更新
this.setData({ resources: newResources });
this.setData({ result: newResult });
```

**日志格式：**
- **规则**：简单日志 `app.log(message, data)`
- **理由**：简单直接，MVP阶段够用，无需复杂分级
- **示例**：
```javascript
// 正确：简单日志
app.log('计算完成', { probability: 0.65, gameId: 'genshin' });
app.log('用户切换游戏', { from: 'genshin', to: 'starrail' });

// 错误：复杂分级
app.logger.info('计算完成', data); // MVP无需info/debug/error分级
```

### Process Patterns

**错误处理流程：**
- **规则**：显示toast + 记录日志
- **理由**：用户友好 + 便于调试，符合NFR31要求
- **实现**：
```javascript
// 正确：toast + 日志
if (!result.success) {
  wx.showToast({
    title: result.error,
    icon: 'none',
    duration: 2000
  });
  app.log('操作失败', { error: result.error, context: {...} });
  return;
}

// 错误：仅记录日志（用户无感知）
if (!result.success) {
  app.log('错误', result.error);
  return; // 用户看不到反馈
}
```

**加载状态管理：**
- **规则**：页面局部loading（自定义UI + `this.setData({ loading: true })`)
- **理由**：用户体验好，符合微信小程序风格，避免全局loading阻塞交互
- **实现**：
```javascript
// pages/history/history.js
Page({
  data: { loading: false, history: [] },

  onLoad() {
    this.setData({ loading: true }); // 开始加载

    const result = historyService.loadHistory();
    this.setData({
      history: result.success ? result.data : [],
      loading: false // 加载完成
    });
  }
});

// pages/history/history.wxml
<view wx:if="{{loading}}" class="loading-container">
  <van-loading size="24px">加载中...</van-loading>
</view>
<view wx:else>
  <!-- 历史记录列表 -->
</view>
```

**数据保存时机：**
- **规则**：页面卸载时保存 + 重要操作立即保存
- **理由**：平衡性能和数据安全，避免频繁写入存储
- **实现**：
```javascript
// 正确：双重保存策略
Page({
  onUnload() {
    // 页面卸载时保存
    storageService.saveCurrentGameResources(this.data.resources);
  },

  onGameSwitch(e) {
    const { gameId } = e.detail;

    // 重要操作立即保存当前游戏数据
    storageService.saveCurrentGameResources(this.data.resources);

    // 切换到新游戏
    gameService.switchGame(gameId);
  },

  onResourceInput() {
    // 普通输入操作，不立即保存（依赖onUnload）
    this.setData({ 'resources.primogems': value });
  }
});
```

**计算触发时机：**
- **规则**：300ms防抖触发计算
- **理由**：已确定，避免频繁计算，满足性能要求
- **实现**：
```javascript
// 已实现
this.debouncedCalculate = debounce(this.calculate.bind(this), 300);

onResourceChange(e) {
  this.setData({ 'resources.primogems': e.detail.value });
  this.debouncedCalculate(); // 300ms后触发
}
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. **命名规范**：
   - 文件和组件使用小写中划线（kebab-case）
   - 变量和JSON字段使用camelCase（小驼峰）
   - 禁止使用其他命名风格

2. **结构规范**：
   - 工具函数统一放在`utils/`
   - 游戏配置统一放在`config/games/`
   - 图片资源按类型分类在`assets/images/games/`和`assets/images/icons/`

3. **格式规范**：
   - 错误消息使用用户友好描述，禁止暴露技术细节
   - 时间显示使用相对时间格式（"刚刚"、"X小时前"）
   - 数字显示使用千分位格式化

4. **通信规范**：
   - 组件事件命名使用小驼峰（`resourceChange`）
   - 事件payload使用对象包装（`{value, type}`）
   - setData使用路径更新（`'resources.primogems'`）
   - 日志使用简单格式（`app.log(message, data)`）

5. **流程规范**：
   - 错误处理：显示toast + 记录日志
   - 加载状态：页面局部loading UI
   - 数据保存：onUnload保存 + 重要操作立即保存
   - 计算触发：300ms防抖

**Pattern Enforcement:**

- **验证方法**：开发过程中按pattern检查代码一致性
- **违规记录**：发现pattern violation时在代码注释中标注
- **更新流程**：pattern需要调整时，更新architecture.md并通知所有agents

### Pattern Examples

**Good Examples:**

```javascript
// ✅ 文件命名：services/game-service.js
// ✅ 变量命名：const currentGameId = 'genshin';
// ✅ JSON字段：{ primogems: 10000, currentPity: 0 }
// ✅ 错误处理：wx.showToast({ title: '数据加载失败', icon: 'none' });
// ✅ 事件命名：this.triggerEvent('resourceChange', { value: 100 });
// ✅ setData路径：this.setData({ 'resources.primogems': 100 });
// ✅ 时间格式：formatRelativeTime(timestamp) → "3小时前"
// ✅ 数字格式：formatNumber(10000) → "10,000"
// ✅ 加载状态：<van-loading wx:if="{{loading}}">加载中...</van-loading>
```

**Anti-Patterns:**

```javascript
// ❌ 文件命名：services/GameService.js（应小写中划线）
// ❌ 变量命名：const current_game_id = 'genshin';（应camelCase）
// ❌ JSON字段：{ primogems_count: 10000 }（应primogems）
// ❌ 错误处理：wx.showToast({ title: 'TypeError at line 45' });（技术细节）
// ❌ 事件命名：this.triggerEvent('resource-change', data);（应小驼峰）
// ❌ setData：this.setData({ resources: entireObject });（应路径更新）
// ❌ 时间格式：'2026-04-04 10:30'（应相对时间）
// ❌ 数字格式：直接显示10000（应格式化为10,000）
// ❌ 加载状态：wx.showLoading({ title: '加载中' });（应页面局部）
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
GachaPlaner/                     # 微信小程序根目录
├── README.md                    # 项目说明文档
├── project.config.json          # 微信小程序项目配置
├── app.json                     # 小程序全局配置（页面、tabBar、window）
├── app.js                       # 小程序入口（全局状态、日志初始化）
├── app.wxss                     # 全局样式（导入variables.wxss、theme.wxss、common.wxss）
├── sitemap.json                 # 站点地图配置
│
├── pages/                       # 页面目录
│   ├── index/                   # 首页（资源总览）
│   │   ├── index.js             # 页面逻辑
│   │   ├── index.wxml           # 页面模板
│   │   ├── index.wxss           # 页面样式
│   │   └── index.json           # 页面配置
│   │
│   ├── planning/                # 规划计算页（核心功能）
│   │   ├── planning.js
│   │   ├── planning.wxml
│   │   ├── planning.wxss
│   │   └── planning.json
│   │
│   ├── history/                 # 历史记录页
│   │   ├── history.js
│   │   ├── history.wxml
│   │   ├── history.wxss
│   │   └── history.json
│   │
│   └── profile/                 # 个人中心页
│       ├── profile.js
│       ├── profile.wxml
│       ├── profile.wxss
│       └── profile.json
│
├── components/                  # 自定义组件
│   ├── overview-card/           # 总览卡片组件
│   │   ├── overview-card.js
│   │   ├── overview-card.wxml
│   │   ├── overview-card.wxss
│   │   ├── overview-card.json
│   │
│   ├── game-card/               # 游戏卡片组件
│   │   ├── game-card.js
│   │   ├── game-card.wxml
│   │   ├── game-card.wxss
│   │   ├── game-card.json
│   │
│   ├── timeline/                # 时间轴组件
│   │   ├── timeline.js
│   │   ├── timeline.wxml
│   │   ├── timeline.wxss
│   │   ├── timeline.json
│   │
│   ├── probability-display/     # 概率展示组件
│   │   ├── probability-display.js
│   │   ├── probability-display.wxml
│   │   ├── probability-display.wxss
│   │   ├── probability-display.json
│   │
│   ├── probability-chart/       # 概率图表组件
│   │   ├── probability-chart.js
│   │   ├── probability-chart.wxml
│   │   ├── probability-chart.wxss
│   │   ├── probability-chart.json
│   │
│   └── suggestion-card/         # 建议卡片组件
│       ├── suggestion-card.js
│       ├── suggestion-card.wxml
│       ├── suggestion-card.wxss
│       └── suggestion-card.json
│
├── core/                        # 核心引擎模块（纯逻辑，无UI依赖）
│   ├── calculator/              # 概率计算引擎
│   │   ├── base-calculator.js   # 基础计算器类
│   │   ├── hard-pity.js         # 硬保底策略（原神、星铁）
│   │   ├── soft-pity.js         # 软保底策略（明日方舟）
│   │   ├── no-pity.js           # 无保底策略（FGO等）
│   │   ├── calculator-factory.js # 计算器工厂（根据游戏类型创建计算器）
│   │   └── probability-utils.js # 概率计算辅助函数
│   │
│   ├── suggestion/              # 智能建议引擎
│   │   ├── suggestion-generator.js # 建议生成逻辑
│   │   ├── risk-analyzer.js     # 风险分析器
│   │   └── strategy-optimizer.js # 策略优化器
│   │
│   └── validator/               # 数据验证器
│       ├── data-validator.js    # 数据完整性验证
│       └── rule-validator.js    # 业务规则验证
│   │
│   └── constants.js             # 核心常量定义
│
├── config/                      # 配置模块
│   ├── games/                   # 游戏配置数据（JSON）
│   │   ├── genshin.json         # 原神配置（保底机制、概率、资源类型）
│   │   ├── starrail.json        # 星铁配置
│   │   └── arknights.json       # 明日方舟配置
│   │
│   ├── config-loader.js         # 配置加载器（读取游戏配置）
│   ├── config-validator.js      # 配置验证器（校验配置完整性）
│   └── app-config.js            # 应用配置（默认游戏、版本号等）
│
├── services/                    # 业务服务层（统一数据访问接口）
│   ├── storage-service.js       # 数据持久化服务（本地存储管理、缓存）
│   ├── game-service.js          # 游戏管理服务（切换、资源更新）
│   ├── history-service.js       # 历史记录服务（记录保存、查询）
│   └── calculation-service.js   # 计算服务（协调calculator和suggestion）
│
├── utils/                       # 工具函数
│   ├── result.js                # Result模式工具（success/error包装）
│   ├── debounce.js              # 防抖函数（300ms触发计算）
│   ├── throttle.js              # 节流函数（图表渲染优化）
│   ├── time-format.js           # 时间格式化（相对时间）
│   ├── number-format.js         # 数字格式化（千分位）
│   └── util.js                  # 通用工具函数
│
├── assets/                      # 静态资源
│   ├── images/                  # 图片资源
│   │   ├── games/               # 游戏图标
│   │   │   ├── genshin.png      # 原神图标
│   │   │   ├── starrail.png     # 星铁图标
│   │   │   └── arknights.png    # 明日方舟图标
│   │   │
│   │   └── icons/               # UI图标
│   │       ├── warning.png      # 警告图标
│   │       ├── success.png      # 成功图标
│   │       └── arrow-right.png  # 右箭头图标
│   │
│   └── fonts/                   # 字体文件（预留）
│
├── styles/                      # 全局样式
│   ├── variables.wxss           # CSS变量（设计令牌：颜色、间距、字体）
│   ├── theme.wxss               # 主题样式（莫兰迪暖色系）
│   └── common.wxss              # 通用样式（卡片、按钮、布局）
│
├── miniprogram_npm/             # npm包构建输出（微信开发者工具生成）
│   └── @vant/weapp/             # Vant Weapp组件库
│
└── package.json                 # npm依赖配置
```

### Architectural Boundaries

**Core Engine Boundaries (core/):**
- **职责**：纯逻辑计算，无UI依赖，不直接调用微信API
- **输入**：游戏配置数据、用户资源数据、目标设定
- **输出**：计算结果（概率分布、建议策略）
- **调用者**：仅services调用，pages不直接调用core
- **边界规则**：
  - ❌ 禁止：调用wx.* API、依赖app.globalData、操作DOM
  - ✅ 允许：纯数学计算、数据验证、结果返回

**Services Boundaries (services/):**
- **职责**：业务逻辑协调，数据访问，微信API调用
- **调用关系**：pages → services → core
- **边界规则**：
  - ✅ 调用：core计算引擎、微信本地存储API、app.globalData
  - ✅ 提供：统一数据访问接口给pages
  - ❌ 禁止：直接操作pages的setData

**Pages Boundaries (pages/):**
- **职责**：UI渲染，用户交互，页面生命周期
- **调用关系**：pages调用services获取数据和服务
- **边界规则**：
  - ✅ 调用：services获取数据和计算结果、components渲染UI
  - ✅ 操作：this.setData更新页面数据、wx.navigateTo页面跳转
  - ❌ 禁止：直接调用core计算引擎、直接操作本地存储

**Components Boundaries (components/):**
- **职责**：UI组件封装，事件触发，属性接收
- **调用关系**：pages使用components，components触发事件给pages
- **边界规则**：
  - ✅ 接收：properties从pages传递数据
  - ✅ 触发：triggerEvent向pages发送事件
  - ❌ 禁止：调用services、直接操作app.globalData

**Config Boundaries (config/):**
- **职责**：配置数据存储，配置加载和验证
- **调用关系**：config-loader被services调用
- **边界规则**：
  - ✅ 存储：静态JSON配置文件（games/*.json）
  - ✅ 提供：config-loader提供配置加载接口
  - ❌ 禁止：包含计算逻辑、包含UI代码

### Requirements to Structure Mapping

**功能需求映射：**

**FR1-FR9: 游戏管理模块**
- **页面**：`pages/index/`（首页资源总览）、`pages/profile/`（游戏切换）
- **组件**：`components/overview-card/`、`components/game-card/`
- **服务**：`services/game-service.js`（游戏切换、资源管理）
- **配置**：`config/games/*.json`（游戏配置数据）
- **数据**：`services/storage-service.js`（本地存储）

**FR10-FR22: 卡池规划与计算模块**
- **页面**：`pages/planning/`（规划计算核心页面）
- **组件**：`components/probability-display/`、`components/probability-chart/`、`components/suggestion-card/`
- **计算引擎**：`core/calculator/`（概率计算）
  - `base-calculator.js`：基础计算逻辑
  - `hard-pity.js`、`soft-pity.js`、`no-pity.js`：不同保底策略
  - `calculator-factory.js`：根据游戏类型创建计算器
- **服务**：`services/calculation-service.js`（协调计算和建议）
- **工具**：`utils/debounce.js`（300ms防抖触发计算）

**FR23-FR26: 数据可视化模块**
- **组件**：`components/probability-chart/`（概率分布图表）
- **依赖**：wx-charts轻量级图表库（miniprogram_npm/）
- **工具**：`utils/throttle.js`（图表渲染节流）
- **性能优化**：数据点限制100个、渲染缓存

**FR27-FR30: 智能建议生成模块**
- **引擎**：`core/suggestion/`
  - `suggestion-generator.js`：建议生成逻辑
  - `risk-analyzer.js`：风险分析
  - `strategy-optimizer.js`：策略优化
- **组件**：`components/suggestion-card/`（建议展示卡片）
- **服务**：`services/calculation-service.js`（调用suggestion引擎）

**FR31-FR37: 历史数据管理模块**
- **页面**：`pages/history/`（历史记录查看）
- **组件**：`components/timeline/`（时间轴展示）
- **服务**：`services/history-service.js`（历史记录保存和查询）
- **数据**：`services/storage-service.js`（历史数据持久化）
- **工具**：`utils/time-format.js`（相对时间格式化）

**FR38-FR44: 自定义游戏模板架构**
- **配置结构**：`config/games/*.json`预留扩展字段
  - `pityType`：保底类型（hard、soft、none）
  - `inheritable`：保底是否可继承
  - `customParams`：自定义参数预留
- **计算引擎**：`core/calculator/no-pity.js`（无保底策略）
- **工厂模式**：`calculator-factory.js`根据pityType创建计算器

**FR45-FR48: 游戏数据管理**
- **配置**：`config/games/*.json`标注版本号和更新日期
- **加载器**：`config/config-loader.js`加载和验证配置
- **验证器**：`config/config-validator.js`校验配置完整性
- **服务**：`services/game-service.js`提供配置数据访问

**NFR Requirements:**

**NFR1-NFR10: 性能要求**
- **计算性能**：`core/calculator/`预计算缓存、增量计算
- **渲染性能**：`components/probability-chart/`数据点限制、渲染节流
- **存储性能**：`services/storage-service.js`智能缓存机制
- **防抖节流**：`utils/debounce.js`（300ms）、`utils/throttle.js`（100ms）

**NFR11-NFR19: 可靠性要求**
- **数据验证**：`core/validator/`分层验证
- **数据迁移**：`services/storage-service.js`版本号迁移机制
- **错误处理**：Result模式（`utils/result.js`）、toast + 日志

**NFR20-NFR28: 数据安全**
- **存储安全**：微信小程序沙箱（天然隔离）
- **数据清除**：`services/storage-service.js clearAllData()`
- **敏感数据**：不console.log用户数据

**NFR29-NFR31: 用户体验**
- **错误提示**：用户友好信息（`utils/result.js error()`）
- **时间格式**：相对时间（`utils/time-format.js`）
- **数字格式**：千分位（`utils/number-format.js`）

**NFR32-NFR34: 可维护性**
- **配置驱动**：`config/games/*.json`数据与逻辑分离
- **模块化**：core、services、components清晰分层
- **pattern规范**：命名、结构、格式统一规范

### Integration Points

**Internal Communication Flow:**

```
用户输入（pages/planning）
  ↓ resourceChange事件
pages调用services（services/calculation-service）
  ↓ 获取资源数据
services调用core（core/calculator）
  ↓ 执行概率计算
core返回Result（{success, data: {probability, distribution}}）
  ↓ services包装数据
services返回Result给pages
  ↓ setData更新页面
pages渲染components（probability-display、probability-chart）
```

**Data Flow:**

```
启动流程（app.js onLaunch）：
  1. storage-service.load() → 从本地存储加载用户数据
  2. storage-service.migrateData() → 版本迁移（如需）
  3. app.globalData初始化 → 缓存用户数据
  4. config-loader.loadGames() → 加载游戏配置

用户输入流程（pages/planning onResourceChange）：
  1. pages.setData({ 'resources.primogems': value })
  2. debouncedCalculate() → 300ms防抖
  3. calculation-service.calculate(resources, target)
  4. calculator.calculate() → 概率计算
  5. suggestion-generator.generate() → 智能建议
  6. pages.setData({ result }) → 更新UI

数据保存流程：
  1. 页面卸载：
  2. storage-service.saveCurrentGameResources(resources)
  3. wx.setStorageSync('user_data', data)
  4. 更新app.globalData缓存

游戏切换流程：
  1. 重要操作立即保存当前游戏数据
  2. game-service.switchGame(gameId)
  3. storage-service.loadCurrentGameResources(gameId) → 缓存命中或读存储
  4. pages.setData({ currentGameId, resources }) → 更新页面
```

**External Integrations:**

- **微信小程序API**：
  - `wx.getStorageSync()` / `wx.setStorageSync()`：本地存储
  - `wx.getLogManager()`：日志管理
  - `wx.onError()`：全局错误捕获
  - `wx.showToast()`：用户提示
  - `wx.navigateTo()`：页面跳转

- **Vant Weapp组件库**（miniprogram_npm/@vant/weapp/）：
  - `<van-button>`：按钮组件
  - `<van-field>`：输入框组件
  - `<van-loading>`：加载状态组件
  - `<van-toast>`：提示组件

- **wx-charts图表库**（后期集成）：
  - 概率分布图表渲染
  - 资源消耗曲线展示

### File Organization Patterns

**Configuration Files:**
- **位置**：根目录
- **文件**：
  - `project.config.json`：微信小程序项目配置
  - `app.json`：页面路由、tabBar、window配置
  - `package.json`：npm依赖（Vant Weapp）
- **规范**：微信小程序标准配置文件

**Source Code Organization:**
- **分层结构**：pages → services → core（三层架构）
- **模块化**：按功能组织（calculator、suggestion、validator）
- **命名**：小写中划线（game-service.js、probability-chart.js）

**Asset Organization:**
- **分类存储**：`assets/images/games/`（游戏图标）、`assets/images/icons/`（UI图标）
- **命名**：小写中划线（genshin.png、warning.png）
- **引用**：绝对路径（`/assets/images/games/genshin.png`）

**MVP阶段测试组织:**
- **决策**：不创建测试目录，快速开发
- **后期扩展**：可创建`tests/`目录补充单元测试

### Development Workflow Integration

**Development Server Structure:**
- **工具**：微信开发者工具
- **调试**：开发版（本地调试）
- **测试**：体验版（邀请测试用户）
- **发布**：正式版（提交审核）

**Build Process Structure:**
- **npm构建**：微信开发者工具 → 工具 → 构建npm
- **输出**：`miniprogram_npm/`目录（Vant Weapp组件）
- **上传**：微信开发者工具 → 上传代码

**Deployment Structure:**
- **审核流程**：上传代码 → 提交审核 → 审核通过 → 发布上线
- **版本管理**：体验版测试 → 正式版发布
- **配置**：单环境配置（project.config.json）
