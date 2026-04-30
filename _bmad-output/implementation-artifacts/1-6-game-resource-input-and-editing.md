# Story 1.6: 游戏资源输入与编辑

Status: done

## Story

As a 用户,
I want 输入和编辑每个游戏的资源数据,
so that 系统可以基于我的实际资源进行计算.

## Acceptance Criteria

1. **Given** 首页已显示游戏列表
   **When** 用户点击游戏卡片进入详情页
   **Then** 页面显示资源输入表单（原石、星琼等）
   **And** 输入控件包括滑块（快速粗调）和步进器（精确微调）
   **And** 输入即自动保存（无需点击保存按钮）
   **And** 支持编辑已有数据
   **And** 数据变化时首页总览自动更新

## Tasks / Subtasks

- [x] **Task 1: 创建规划计算页面结构** (AC: 1)
  - [x] 1.1 创建pages/planning/planning.js页面逻辑文件
  - [x] 1.2 创建pages/planning/planning.wxml页面模板文件
  - [x] 1.3 创建pages/planning/planning.wxss页面样式文件
  - [x] 1.4 创建pages/planning/planning.json页面配置文件
  - [x] 1.5 在app.json中注册规划页路由

- [x] **Task 2: 实现资源输入表单组件** (AC: 1)
  - [x] 2.1 创建components/resource-input/resource-input.js组件逻辑
  - [x] 2.2 创建components/resource-input/resource-input.wxml组件模板
  - [x] 2.3 创建components/resource-input/resource-input.wxss组件样式
  - [x] 2.4 创建components/resource-input/resource-input.json组件配置
  - [x] 2.5 实现滑块控件（快速粗调，步进100）
  - [x] 2.6 实现步进器控件（精确微调，步进1）
  - [x] 2.7 实现数字输入框（直接输入精确值）
  - [x] 2.8 实现资源类型动态切换（根据游戏配置）

- [x] **Task 3: 实现自动保存机制** (AC: 1)
  - [x] 3.1 在resource-input组件中实现防抖保存（300ms防抖）
  - [x] 3.2 调用gameService.updateResources()保存数据
  - [x] 3.3 保存成功显示Toast提示（"已保存"）
  - [x] 3.4 保存失败显示错误提示
  - [x] 3.5 Console输出保存日志

- [x] **Task 4: 实现页面数据加载** (AC: 1)
  - [x] 4.1 在planning.js的onLoad中获取gameId参数
  - [x] 4.2 调用gameService.getGameConfig()获取游戏配置
  - [x] 4.3 调用gameService.getCurrentResources()获取当前资源
  - [x] 4.4 根据游戏配置动态生成资源输入项
  - [x] 4.5 处理首次使用情况（显示默认值0）
  - [x] 4.6 错误处理（数据加载失败显示友好提示）

- [x] **Task 5: 实现首页数据同步** (AC: 1)
  - [x] 5.1 使用wx.eventChannel或全局事件通信
  - [x] 5.2 资源变化时触发事件通知首页
  - [x] 5.3 首页监听事件并重新加载数据
  - [x] 5.4 验证首页总览自动更新

- [x] **Task 6: 应用莫兰迪暖色系视觉风格** (AC: 1)
  - [x] 6.1 使用CSS变量应用颜色
  - [x] 6.2 输入控件样式符合设计规范
  - [x] 6.3 滑块轨道颜色使用Primary Light
  - [x] 6.4 步进器按钮使用Primary色
  - [x] 6.5 数字输入框使用等宽字体

- [x] **Task 7: 验证资源输入功能** (AC: 1)
  - [x] 7.1 测试资源输入表单正确显示
  - [x] 7.2 测试滑块控件功能
  - [x] 7.3 测试步进器控件功能
  - [x] 7.4 测试自动保存功能
  - [x] 7.5 测试首页数据同步
  - [x] 7.6 Console输出测试结果

## Dev Notes

### 关键技术决策

**页面结构设计：**
- 规划计算页采用左右分屏布局（UX-DR13）
- 左侧：资源输入区（40%宽度）
- 右侧：规划结果区（60%宽度，本次暂不实现）
- 一屏完整，无需滚动

**组件化设计：**
- 资源输入组件（components/resource-input/）：自定义组件，提供滑块+步进器+输入框组合控件
- 使用微信小程序原生slider组件
- 使用微信小程序原生input组件
- 使用Vant Weapp Stepper组件（如有）或自定义步进器

**数据流设计：**
- onLoad时从路由参数获取gameId
- 从gameService加载游戏配置和资源数据
- 输入变化时防抖保存（300ms）
- 保存成功后通知首页更新

**自动保存机制：**
- 使用防抖函数避免频繁保存
- 输入变化300ms后触发保存
- 调用gameService.updateResources()
- 保存成功显示Toast提示

**视觉风格：**
- 莫兰迪暖色系设计系统
- 输入控件圆角8px
- 数字使用等宽字体（SF Mono、Monaco）
- 滑块轨道使用Primary Light色

### 页面布局设计

**页面结构：**

```wxml
<!-- pages/planning/planning.wxml -->
<view class="planning-container">
  <!-- 页面标题 -->
  <view class="page-header">
    <text class="game-name">{{gameName}}</text>
    <text class="page-title">资源管理</text>
  </view>

  <!-- 资源输入区域 -->
  <view class="resource-input-section">
    <view class="section-title">💰 我的资源</view>
    <block wx:for="{{resourceTypes}}" wx:key="key">
      <resource-input
        resource-key="{{item.key}}"
        resource-name="{{item.name}}"
        resource-icon="{{item.icon}}"
        value="{{resources[item.key]}}"
        min="{{0}}"
        max="{{item.max || 100000}}"
        step="{{item.step || 1}}"
        bind:change="onResourceChange"
      />
    </block>
  </view>

  <!-- 规划结果区域（预留） -->
  <view class="planning-result-section">
    <!-- TODO: Story 2.5实现 -->
  </view>
</view>
```

### 组件实现要点

**资源输入组件（ResourceInput）：**

```javascript
// components/resource-input/resource-input.js
Component({
  properties: {
    resourceKey: { type: String, value: '' },
    resourceName: { type: String, value: '' },
    resourceIcon: { type: String, value: '' },
    value: { type: Number, value: 0 },
    min: { type: Number, value: 0 },
    max: { type: Number, value: 100000 },
    step: { type: Number, value: 1 }
  },

  data: {
    sliderValue: 0,
    inputValue: 0
  },

  methods: {
    /**
     * 滑块变化事件
     */
    onSliderChange(e) {
      const value = e.detail.value;
      this.setData({
        sliderValue: value,
        inputValue: value
      });
      this.triggerChange(value);
    },

    /**
     * 步进器增加
     */
    onStepperIncrease() {
      const newValue = Math.min(this.data.value + this.data.step, this.data.max);
      this.updateValue(newValue);
    },

    /**
     * 步进器减少
     */
    onStepperDecrease() {
      const newValue = Math.max(this.data.value - this.data.step, this.data.min);
      this.updateValue(newValue);
    },

    /**
     * 输入框变化事件
     */
    onInputChange(e) {
      const value = parseInt(e.detail.value) || 0;
      const clampedValue = Math.max(this.data.min, Math.min(value, this.data.max));
      this.updateValue(clampedValue);
    },

    /**
     * 更新值并触发事件
     */
    updateValue(value) {
      this.setData({
        sliderValue: value,
        inputValue: value
      });
      this.triggerChange(value);
    },

    /**
     * 触发change事件（防抖）
     */
    triggerChange: debounce(function(value) {
      this.triggerEvent('change', {
        key: this.data.resourceKey,
        value: value
      });
    }, 300)
  },

  observers: {
    'value': function(val) {
      this.setData({
        sliderValue: val,
        inputValue: val
      });
    }
  }
});
```

### 数据加载逻辑

**规划页面数据加载：**

```javascript
// pages/planning/planning.js
const gameService = require('../../services/game-service');

Page({
  data: {
    gameId: '',
    gameName: '',
    gameIcon: '',
    resourceTypes: [],
    resources: {},
    loading: true
  },

  onLoad(options) {
    const { gameId } = options;
    if (!gameId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({ gameId });
    this.loadData();
  },

  loadData() {
    const { gameId } = this.data;

    // 1. 获取游戏配置
    const configResult = gameService.getGameConfig(gameId);
    if (!configResult.success) {
      wx.showToast({
        title: '游戏配置加载失败',
        icon: 'none'
      });
      return;
    }

    const config = configResult.data;

    // 2. 获取当前资源
    const resourcesResult = gameService.getCurrentResources();
    const resources = resourcesResult.success ? resourcesResult.data : {};

    // 3. 构建资源类型列表
    const resourceTypes = Object.keys(config.resources).map(key => ({
      key,
      name: config.resources[key].name,
      icon: config.resources[key].icon,
      max: 100000, // 可根据资源类型设置不同上限
      step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
    }));

    // 4. 更新页面数据
    this.setData({
      gameName: config.name,
      gameIcon: `/assets/images/games/${gameId}.png`,
      resourceTypes,
      resources,
      loading: false
    });
  },

  onResourceChange(e) {
    const { key, value } = e.detail;
    console.log('资源变化:', key, value);

    // 更新资源数据
    const resources = { ...this.data.resources };
    resources[key] = value;

    this.setData({ resources });

    // 自动保存
    this.saveResources();
  },

  saveResources: debounce(function() {
    const { gameId, resources } = this.data;

    const result = gameService.updateResources(gameId, resources);

    if (result.success) {
      wx.showToast({
        title: '已保存',
        icon: 'success',
        duration: 1000
      });

      // 通知首页更新
      this.notifyHomePage();
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }, 300),

  notifyHomePage() {
    // 使用全局事件或eventChannel通知首页
    const pages = getCurrentPages();
    const indexPage = pages.find(p => p.route === 'pages/index/index');
    if (indexPage) {
      indexPage.loadData();
    }
  }
});
```

### 样式设计规范

**规划页面样式（pages/planning/planning.wxss）：**

```css
.planning-container {
  padding: var(--spacing-xl);
  background-color: var(--color-gray-50);
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.game-name {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-800);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.page-title {
  font-size: var(--font-size-body);
  color: var(--color-gray-600);
}

.resource-input-section {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}
```

**资源输入组件样式（components/resource-input/resource-input.wxss）：**

```css
.resource-input {
  margin-bottom: var(--spacing-lg);
}

.resource-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.resource-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: var(--spacing-sm);
}

.resource-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.resource-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 滑块样式 */
.slider-container {
  width: 100%;
}

.slider {
  width: 100%;
  height: 48rpx;
}

/* 步进器和输入框容器 */
.input-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stepper-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-h3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn:active {
  background-color: var(--color-primary-dark);
}

.number-input {
  flex: 1;
  height: 64rpx;
  border: 2rpx solid var(--color-gray-300);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-body);
  font-family: 'SF Mono', 'Monaco', monospace;
  color: var(--color-gray-800);
  text-align: center;
}
```

### 防抖函数实现

**utils/debounce.js：**

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

module.exports = { debounce };
```

### 错误处理

**错误场景：**
- 游戏ID参数缺失
- 游戏配置加载失败
- 资源数据加载失败
- 保存失败

**错误处理策略：**
- 参数错误显示提示并返回上一页
- 数据加载失败显示友好提示
- 保存失败显示错误提示，允许重试
- 关键操作记录console日志

### 测试验证

**验证页面加载：**
- [ ] 页面正确显示游戏名称和资源输入表单
- [ ] 资源类型根据游戏配置动态生成
- [ ] 首次使用显示默认值0

**验证输入控件：**
- [ ] 滑块可以快速粗调
- [ ] 步进器可以精确微调
- [ ] 输入框可以直接输入精确值
- [ ] 输入值在min-max范围内

**验证自动保存：**
- [ ] 输入变化300ms后自动保存
- [ ] 保存成功显示Toast提示
- [ ] 数据持久化到本地存储

**验证首页同步：**
- [ ] 资源变化后首页总览自动更新
- [ ] 总资源数量正确更新
- [ ] 资源分配比例正确更新

### Project Structure Notes

**文件位置：**
- pages/planning/ - 规划计算页面目录
- components/resource-input/ - 资源输入组件目录
- utils/debounce.js - 防抖函数工具

**模块依赖：**
- services/game-service.js - 游戏管理服务
- config/config-loader.js - 配置加载器
- utils/debounce.js - 防抖函数

**命名规范：**
- 文件命名：小写中划线（planning.js、resource-input.js）
- 组件命名：小写中划线（resource-input）
- 变量命名：camelCase（gameId、resourceTypes）
- CSS变量：小写中划线（--primary、--spacing-lg）

### References

- [Source: architecture.md#项目结构设计]
- [Source: architecture.md#状态管理方法]
- [Source: architecture.md#命名与格式规范]
- [Source: prd.md#FR4-输入资源数量]
- [Source: prd.md#FR5-编辑资源数据]
- [Source: prd.md#NFR29-核心操作路径]
- [Source: ux-design-specification.md#规划计算页左右分屏布局]
- [Source: ux-design-specification.md#即时反馈交互模式]
- [Source: ux-design-specification.md#莫兰迪暖色系设计系统]
- [Source: epics.md#Story 1.6]

### Common LLM Mistakes to Prevent

**避免以下常见错误：**

1. **不要忘记引入gameService** - 规划页必须require('../../services/game-service')
2. **不要忘记引入debounce** - 必须require('../../utils/debounce')
3. **不要硬编码资源类型** - 根据游戏配置动态生成
4. **不要忽略首次使用情况** - 处理无数据情况，显示默认值0
5. **不要忘记应用莫兰迪暖色系** - 使用CSS变量，不要硬编码颜色值
6. **不要忘记自动保存** - 输入变化300ms后自动保存
7. **不要忘记首页同步** - 资源变化后通知首页更新
8. **不要使用点击保存按钮** - 输入即自动保存，无需保存按钮
9. **不要忘记防抖** - 避免频繁保存，使用防抖函数
10. **不要忽略输入范围验证** - 确保输入值在min-max范围内

### Previous Story Context

**Story 1.5已实现：**
- pages/index/index.js首页页面
- components/overview-card/总览卡片组件
- components/game-card/游戏卡片组件
- 游戏卡片点击跳转到规划页功能
- 莫兰迪暖色系视觉风格

**Story 1.4已实现：**
- services/game-service.js游戏管理服务
- switchGame()、getCurrentResources()、updateResources()方法
- 游戏切换、资源获取、资源更新功能

**Story 1.3已实现：**
- services/storage-service.js存储服务
- loadCurrentGameResources()、updateResources()方法
- 数据持久化、智能缓存机制

**Story 1.2已实现：**
- config/config-loader.js配置加载器
- loadGameConfig()、loadAllGames()方法
- 游戏配置数据结构

**Story 1.6依赖：**
- gameService提供游戏配置和资源数据
- storageService提供数据持久化支持
- configLoader提供游戏配置支持
- Result模式工具函数
- 防抖函数工具

### Next Story Context

**Story 1.7将依赖：**
- 规划页已实现资源输入功能
- gameService.updateResources()方法可用
- 为数据清除功能提供基础

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

待实现后填写。

### Completion Notes List

Story 1.6: 游戏资源输入与编辑已完成。

**实现内容：**
1. ✓ 创建规划计算页面结构
2. ✓ 实现资源输入表单组件 (resource-input) - 滑块+步进器+输入框组合控件
3. ✓ 实现自动保存机制 - 300ms防抖保存
4. ✓ 实现页面数据加载 - 从gameService加载游戏配置和资源数据
5. ✓ 实现首页数据同步 - 通过页面栈通知首页更新
6. ✓ 应用莫兰迪暖色系视觉风格 - CSS变量设计令牌
7. ✓ 验证资源输入功能 - Console输出测试结果

**关键技术实现：**
- 使用防抖函数避免频繁保存 (utils/debounce.js)
- 资源输入组件提供三种输入方式：滑块(快速粗调)、步进器(精确微调)、输入框(直接输入)
- 输入变化300ms后自动保存到本地存储
- 保存成功后通过页面栈查找首页并调用loadData()更新总览
- 滑块轨道使用Primary Light色(#D4BC99)，步进器按钮使用Primary色(#C4A77D)
- 数字输入框使用等宽字体(SF Mono、Monaco)

**测试验证：**
```
=== 规划页加载 ===
页面参数: {gameId: "genshin"}
加载游戏数据: genshin
✓ 游戏配置: {gameId: "genshin", name: "原神", ...}
✓ 当前资源: {primogems: 1600, ...}
✓ 资源类型列表: [{key: "primogems", name: "原石", ...}]
=== 规划页数据加载完成 ===

资源输入变化: primogems 3200
保存资源数据: genshin {primogems: 3200, ...}
通知首页更新
```

**文件清单：**
- utils/debounce.js (创建) - 防抖函数工具
- components/resource-input/resource-input.js (创建) - 资源输入组件逻辑
- components/resource-input/resource-input.wxml (创建) - 资源输入组件模板
- components/resource-input/resource-input.wxss (创建) - 资源输入组件样式
- components/resource-input/resource-input.json (创建) - 资源输入组件配置
- pages/planning/planning.js (修改) - 规划页面逻辑
- pages/planning/planning.wxml (修改) - 规划页面模板
- pages/planning/planning.wxss (修改) - 规划页面样式
- pages/planning/planning.json (修改) - 规划页面配置

### File List

已创建的文件：
- utils/debounce.js (创建) - 防抖函数工具
- components/resource-input/resource-input.js (创建) - 资源输入组件逻辑
- components/resource-input/resource-input.wxml (创建) - 资源输入组件模板
- components/resource-input/resource-input.wxss (创建) - 资源输入组件样式
- components/resource-input/resource-input.json (创建) - 资源输入组件配置
- pages/planning/planning.js (修改) - 规划页面逻辑
- pages/planning/planning.wxml (修改) - 规划页面模板
- pages/planning/planning.wxss (修改) - 规划页面样式
- pages/planning/planning.json (修改) - 规划页面配置
- app.js (修改) - 添加selectedGameId全局数据
- app.json (已存在，无需修改) - 规划页路由已注册
- components/game-card/game-card.wxml (修改) - 使用catchtap阻止事件冒泡
- components/game-card/game-card.js (修改) - 添加防重复点击机制
- pages/index/index.js (修改) - 游戏卡片点击跳转逻辑
- services/game-service.js (修改) - updateResources支持可选gameId参数
- assets/images/games/primogem.png (创建) - 原石图标占位
- assets/images/games/intertwined-fate.png (创建) - 纠缠之缘图标占位
- assets/images/games/stellar-jade.png (创建) - 星琼图标占位
- assets/images/games/star-rail-pass.png (创建) - 星轨通票图标占位
