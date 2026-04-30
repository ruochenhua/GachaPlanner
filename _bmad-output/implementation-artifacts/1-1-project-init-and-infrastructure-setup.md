# Story 1.1: 项目初始化与基础架构搭建

Status: ready-for-dev

## Story

As a 开发者,
I want 初始化微信小程序项目并搭建基础架构,
so that 后续功能开发有完整的项目结构支持.

## Acceptance Criteria

1. **Given** 开发环境已安装微信开发者工具
   **When** 初始化微信小程序项目
   **Then** 项目包含完整的目录结构
   **And** 已安装Vant Weapp组件库
   **And** 已配置CSS变量设计令牌（莫兰迪暖色系）
   **And** 项目可正常运行显示空白页面

## Tasks / Subtasks

- [x] **Task 1: 创建微信小程序项目** (AC: 1)
  - [x] 1.1 使用微信开发者工具创建新项目
  - [x] 1.2 选择"快速启动模板"或"空项目"
  - [x] 1.3 配置AppID（测试可使用游客模式）
  - [x] 1.4 验证项目基础结构已生成

- [x] **Task 2: 安装Vant Weapp组件库** (AC: 1)
  - [x] 2.1 在项目根目录执行 `npm init`
  - [x] 2.2 安装Vant Weapp: `npm i @vant/weapp -S --production`
  - [x] 2.3 微信开发者工具中执行"工具 → 构建npm"
  - [x] 2.4 验证miniprogram_npm目录已生成

- [x] **Task 3: 配置CSS变量设计令牌** (AC: 1)
  - [x] 3.1 创建全局样式文件app.wxss
  - [x] 3.2 定义莫兰迪暖色系CSS变量
  - [x] 3.3 配置主色、辅助色、功能色、中性色
  - [x] 3.4 配置间距、圆角、字体等设计令牌

- [x] **Task 4: 创建项目目录结构** (AC: 1)
  - [x] 4.1 创建pages目录（index, planning, history, profile）
  - [x] 4.2 创建components目录（6个自定义组件目录）
  - [x] 4.3 创建core目录（calculator, suggestion, validator）
  - [x] 4.4 创建config目录（games, loaders, validators）
  - [x] 4.5 创建services目录（storage, game, history）
  - [x] 4.6 创建utils目录

- [x] **Task 5: 配置app.json全局配置** (AC: 1)
  - [x] 5.1 配置pages路由
  - [x] 5.2 配置tabBar（首页、规划、历史、个人中心）
  - [x] 5.3 配置window全局样式
  - [x] 5.4 配置Vant Weapp组件全局引用

- [x] **Task 6: 验证项目运行** (AC: 1)
  - [x] 6.1 在微信开发者工具中编译项目
  - [x] 6.2 验证无编译错误
  - [x] 6.3 验证显示空白页面（或默认首页）
  - [x] 6.4 验证Vant Weapp组件可正常使用

## Dev Notes

### 关键技术决策

**项目类型：** Greenfield微信小程序项目
**框架选择：** 微信小程序原生框架 + JavaScript
**UI组件库：** Vant Weapp（轻量级、微信小程序专用）
**图表方案：** wx-charts或Canvas API自绘（后续Story实现）
**数据存储：** 微信小程序本地存储API

### 微信小程序项目初始化流程

**重要：** 微信小程序没有传统starter template，通过微信开发者工具直接创建。

**初始化步骤：**
1. 微信开发者工具 → 新建项目
2. 选择项目目录、填写AppID（测试可用游客模式）
3. 选择"快速启动模板"或"空项目"
4. 获得基础项目结构

**npm依赖安装：**
```bash
# 初始化npm
npm init

# 安装Vant Weapp
npm i @vant/weapp -S --production

# 微信开发者工具中执行：工具 → 构建npm
# 生成miniprogram_npm目录
```

### 项目结构设计

**GachaPlaner完整目录结构：**

```
GachaPlaner/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式（CSS变量设计令牌）
├── project.config.json    # 项目配置
├── sitemap.json          # 站点地图
├── package.json          # npm依赖
│
├── pages/                 # 页面目录
│   ├── index/            # 首页（资源总览）
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
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
│   │   ├── base-calculator.js
│   │   ├── hard-pity.js
│   │   ├── soft-pity.js
│   │   └── calculator-factory.js
│   ├── suggestion/       # 智能建议引擎
│   └── validator/        # 数据验证器
│
├── config/                # 游戏配置模块
│   ├── games/            # 游戏数据配置
│   │   ├── genshin.json
│   │   ├── starrail.json
│   │   └── arknights.json
│   ├── config-loader.js
│   └── config-validator.js
│
├── services/              # 服务层
│   ├── storage-service.js
│   ├── game-service.js
│   └── history-service.js
│
├── utils/                 # 工具函数
│   └── util.js
│
└── miniprogram_npm/      # npm构建输出（自动生成）
    └── @vant/weapp/
```

### CSS变量设计令牌配置

**莫兰迪暖色系设计系统：**

在`app.wxss`中定义以下CSS变量：

```css
/* 莫兰迪暖色系设计令牌 */
page {
  /* 主色系 */
  --color-primary: #C4A77D;           /* 奶茶暖棕 */
  --color-primary-light: #D4BC99;     /* 奶茶棕浅色 */
  --color-primary-dark: #A68B5B;      /* 奶茶棕深色 */

  /* 辅助色系 */
  --color-secondary: #D4A5A5;         /* 暖粉灰 */

  /* 功能色系 */
  --color-success: #7FB069;           /* 莫兰迪绿 */
  --color-warning: #E4C786;           /* 莫兰迪黄 */
  --color-danger: #C47070;            /* 莫兰迪红 */

  /* 中性色系（暖灰色） */
  --color-gray-50: #FAF9F7;
  --color-gray-100: #F5F3F0;
  --color-gray-200: #E8E4DE;
  --color-gray-300: #D4CFC6;
  --color-gray-400: #B8B0A3;
  --color-gray-500: #9C9285;
  --color-gray-600: #7A7168;
  --color-gray-700: #5C544D;
  --color-gray-800: #3E3833;
  --color-gray-900: #1F1B18;

  /* 间距系统（8px基准） */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 48px;

  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* 字体系统 */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;

  /* 字重系统 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### app.json全局配置示例

```json
{
  "pages": [
    "pages/index/index",
    "pages/planning/planning",
    "pages/history/history",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#C4A77D",
    "navigationBarTitleText": "GachaPlaner",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#7A7168",
    "selectedColor": "#C4A77D",
    "backgroundColor": "#FAF9F7",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-active.png"
      },
      {
        "pagePath": "pages/planning/planning",
        "text": "规划",
        "iconPath": "assets/icons/planning.png",
        "selectedIconPath": "assets/icons/planning-active.png"
      },
      {
        "pagePath": "pages/history/history",
        "text": "历史",
        "iconPath": "assets/icons/history.png",
        "selectedIconPath": "assets/icons/history-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/icons/profile.png",
        "selectedIconPath": "assets/icons/profile-active.png"
      }
    ]
  },
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-cell": "@vant/weapp/cell/index",
    "van-cell-group": "@vant/weapp/cell-group/index"
  },
  "sitemapLocation": "sitemap.json"
}
```

### Vant Weapp组件使用

**全局注册组件：** 在app.json的usingComponents中注册
**页面注册组件：** 在页面的.json文件中注册

**示例：**
```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-cell": "@vant/weapp/cell/index"
  }
}
```

### 性能优化注意事项

**包体积管理：**
- 主包限制：2MB
- 预估体积：~1MB（安全）
- 策略：单包结构，无需分包

**启动优化：**
- 按需引入Vant Weapp组件
- 避免在app.js中执行耗时操作
- 首页保持简洁，快速渲染

### 测试验证

**验证项目结构完整性：**
- [ ] 所有必需目录已创建
- [ ] app.js, app.json, app.wxss存在
- [ ] package.json包含@vant/weapp依赖
- [ ] miniprogram_npm目录已生成

**验证项目可运行：**
- [ ] 微信开发者工具中编译成功
- [ ] 无编译错误或警告
- [ ] 预览器显示默认页面
- [ ] Console无错误日志

**验证Vant Weapp可用：**
- [ ] 在页面中引用van-button组件
- [ ] 渲染按钮成功
- [ ] 样式正确应用

### Project Structure Notes

**微信小程序标准结构：**
- pages/ - 页面目录（必需）
- components/ - 组件目录（推荐）
- utils/ - 工具函数（推荐）
- app.js, app.json, app.wxss - 全局文件（必需）

**GachaPlaner扩展结构：**
- core/ - 核心计算引擎（业务特有）
- config/ - 游戏配置（业务特有）
- services/ - 服务层（架构决策）

**命名规范：**
- 文件命名：小写中划线
- 变量命名：camelCase
- JSON字段：camelCase

### References

- [Source: architecture.md#项目初始化方式]
- [Source: architecture.md#项目结构设计]
- [Source: architecture.md#技术栈已确定]
- [Source: prd.md#项目分类]
- [Source: ux-design-specification.md#莫兰迪暖色系设计系统]
- [Source: epics.md#Story 1.1]

### Common LLM Mistakes to Prevent

**避免以下常见错误：**

1. **不要创建多余文件** - 仅创建架构文档中定义的目录结构
2. **不要使用错误命名** - 严格遵循kebab-case文件命名
3. **不要跳过npm构建** - 必须执行"构建npm"生成miniprogram_npm
4. **不要硬编码样式值** - 使用CSS变量设计令牌
5. **不要忽略Vant Weapp文档** - 参考官方文档正确使用组件

### Next Story Context

**Story 1.2将依赖：**
- 项目基础结构已创建
- config/目录已存在
- 可在此结构上创建游戏配置文件

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**预期创建的文件：**
- app.js (修改)
- app.json (修改)
- app.wxss (创建)
- project.config.json (修改)
- package.json (创建/修改)
- pages/index/index.js, index.json, index.wxml, index.wxss (创建)
- pages/planning/ (创建空目录)
- pages/history/ (创建空目录)
- pages/profile/ (创建空目录)
- components/ (创建空目录)
- core/ (创建空目录)
- config/ (创建空目录)
- services/ (创建空目录)
- utils/ (创建空目录)