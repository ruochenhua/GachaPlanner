# Story 1.8: 游戏数据版本查看

Status: done

## Story

As a 用户,
I want 查看游戏数据的版本和更新日期,
so that 了解数据的时效性.

## Acceptance Criteria

1. **Given** 游戏配置数据已加载
   **When** 用户查看游戏详情
   **Then** 显示游戏数据版本号（如v1.0.0）
   **And** 显示数据更新日期（如"原神数据更新于2026-04-01"）
   **And** 数据超过30天未更新时显示提示
   **And** 提示文字："数据可能过期，请核对官方公告"

## Tasks / Subtasks

- [x] **Task 1: 实现版本信息显示** (AC: 1)
  - [x] 1.1 在planning.js中获取游戏配置的version和updatedAt
  - [x] 1.2 计算距离上次更新的天数
  - [x] 1.3 判断是否超过30天未更新
  - [x] 1.4 更新页面data添加版本信息字段

- [x] **Task 2: 创建版本信息UI组件** (AC: 1)
  - [x] 2.1 在planning.wxml中添加版本信息显示区域
  - [x] 2.2 显示版本号（如"数据版本：v1.0.0"）
  - [x] 2.3 显示更新日期（如"更新日期：2026-04-01"）
  - [x] 2.4 超过30天显示过期提示（Warning色）
  - [x] 2.5 使用图标增强视觉效果

- [x] **Task 3: 应用莫兰迪暖色系视觉风格** (AC: 1)
  - [x] 3.1 使用CSS变量应用颜色
  - [x] 3.2 版本信息区域使用Gray 100背景
  - [x] 3.3 过期提示使用Warning色(#E4C786)
  - [x] 3.4 文字颜色使用Gray 600/700

- [x] **Task 4: 验证版本信息功能** (AC: 1)
  - [x] 4.1 测试版本号正确显示
  - [x] 4.2 测试更新日期正确显示
  - [x] 4.3 测试30天内不显示过期提示
  - [x] 4.4 测试超过30天显示过期提示
  - [x] 4.5 Console输出测试结果

## Dev Notes

### 关键技术决策

**版本信息来源：**
- 游戏配置文件（config/games/*.json）已包含version和updatedAt字段
- version: 数据版本号（如"1.0.0"）
- updatedAt: 数据更新日期（如"2026-04-01"）

**过期检测逻辑：**
- 计算当前日期与updatedAt的差值
- 差值 > 30天则显示过期提示
- 提示文字："数据可能过期，请核对官方公告"
- 提示使用Warning色(#E4C786)背景

**显示位置：**
- 在规划页（planning）资源输入区域下方显示
- 不影响资源输入功能
- 信息清晰但不突兀

**视觉风格：**
- 莫兰迪暖色系设计系统
- 版本信息区域使用Gray 100背景
- 正常状态文字使用Gray 600
- 过期提示使用Warning色背景和Warning色深色文字

### 版本信息计算逻辑

**规划页面逻辑（pages/planning/planning.js）：**

```javascript
// pages/planning/planning.js
const gameService = require('../../services/game-service');

Page({
  data: {
    gameId: '',
    gameName: '',
    resourceTypes: [],
    resources: {},
    // 版本信息
    dataVersion: '',
    updatedAt: '',
    isDataOutdated: false,
    daysSinceUpdate: 0
  },

  onShow() {
    const app = getApp();
    const gameId = app.globalData.selectedGameId || 'genshin';

    if (this.data.gameId === gameId && this.data.gameName) {
      return;
    }

    // 获取游戏配置
    const configResult = gameService.getGameConfig(gameId);
    if (!configResult.success) {
      console.error('配置加载失败');
      return;
    }

    const config = configResult.data;

    // 计算版本信息
    const versionInfo = this.calculateVersionInfo(config.updatedAt);

    // 构建资源类型列表
    const resourceTypes = Object.keys(config.resources).map(key => ({
      key,
      name: config.resources[key].name,
      icon: config.resources[key].icon,
      max: 100000,
      step: key === 'primogems' || key === 'stellarJade' ? 160 : 1
    }));

    // 获取资源数据
    const resourcesResult = gameService.getCurrentResources();
    const resources = resourcesResult.success ? resourcesResult.data : {};

    this.setData({
      gameId,
      gameName: config.name,
      resourceTypes,
      resources,
      dataVersion: config.version,
      updatedAt: config.updatedAt,
      isDataOutdated: versionInfo.isOutdated,
      daysSinceUpdate: versionInfo.daysSinceUpdate
    });
  },

  /**
   * 计算版本信息
   * @param {string} updatedAt - 更新日期（YYYY-MM-DD）
   * @returns {Object} 版本信息 {isOutdated, daysSinceUpdate}
   */
  calculateVersionInfo(updatedAt) {
    const updateDate = new Date(updatedAt);
    const currentDate = new Date();
    const diffTime = currentDate - updateDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      isOutdated: diffDays > 30,
      daysSinceUpdate: diffDays
    };
  },

  onResourceChange(e) {
    // ... 保存逻辑保持不变
  }
});
```

### 页面布局设计

**版本信息区域（pages/planning/planning.wxml）：**

```wxml
<!-- pages/planning/planning.wxml -->
<view class="planning-container">
  <!-- 页面标题 -->
  <view class="page-header">
    <text class="game-name">{{gameName}}</text>
    <text class="page-title">资源管理</text>
  </view>

  <!-- 版本信息区域 -->
  <view class="version-info-section">
    <view class="version-info-item">
      <text class="version-label">📋 数据版本：</text>
      <text class="version-value">v{{dataVersion}}</text>
    </view>
    <view class="version-info-item">
      <text class="version-label">📅 更新日期：</text>
      <text class="version-value">{{updatedAt}}</text>
    </view>
    <!-- 过期提示 -->
    <view class="outdated-warning" wx:if="{{isDataOutdated}}">
      <text class="warning-icon">⚠️</text>
      <text class="warning-text">数据可能过期，请核对官方公告</text>
    </view>
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

### 样式设计规范

**版本信息样式（pages/planning/planning.wxss）：**

```css
/* 版本信息区域 */
.version-info-section {
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.version-info-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.version-info-item:last-child {
  margin-bottom: 0;
}

.version-label {
  font-size: var(--font-size-body-sm);
  color: var(--color-gray-600);
  margin-right: var(--spacing-xs);
}

.version-value {
  font-size: var(--font-size-body-sm);
  color: var(--color-gray-700);
  font-weight: var(--font-weight-medium);
}

/* 过期提示 */
.outdated-warning {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-warning);
  border-radius: var(--radius-md);
}

.warning-icon {
  font-size: 16px;
  margin-right: var(--spacing-xs);
}

.warning-text {
  font-size: var(--font-size-caption);
  color: var(--color-gray-800);
  font-weight: var(--font-weight-medium);
}
```

### 错误处理

**错误场景：**
- updatedAt格式错误
- 日期计算异常

**错误处理策略：**
- 日期解析失败时不显示过期提示
- 异常情况记录console日志
- 不影响资源输入功能

### 测试验证

**验证版本信息显示：**
- [ ] 版本号正确显示（如"v1.0.0"）
- [ ] 更新日期正确显示（如"2026-04-01"）
- [ ] 版本信息区域样式符合设计规范

**验证过期检测：**
- [ ] 30天内不显示过期提示
- [ ] 超过30天显示过期提示
- [ ] 过期提示使用Warning色背景
- [ ] 过期提示文字清晰明确

**验证不影响资源输入：**
- [ ] 资源输入功能正常
- [ ] 自动保存功能正常
- [ ] 首页数据同步正常

### Project Structure Notes

**文件位置：**
- pages/planning/ - 规划计算页面目录

**模块依赖：**
- services/game-service.js - 游戏管理服务
- config/games/*.json - 游戏配置数据（已有version和updatedAt）

**命名规范：**
- 文件命名：小写中划线（planning.js）
- 变量命名：camelCase（dataVersion、isDataOutdated）
- CSS变量：小写中划线（--color-warning）

### References

- [Source: architecture.md#数据迁移与版本管理]
- [Source: architecture.md#数据持久化统一]
- [Source: prd.md#FR9-查看游戏数据版本和更新日期]
- [Source: prd.md#FR46-标注游戏数据版本号]
- [Source: prd.md#FR47-标注游戏数据更新日期]
- [Source: prd.md#FR48-数据过期提示]
- [Source: prd.md#NFR26-数据版本管理]
- [Source: ux-design-specification.md#计算透明]
- [Source: ux-design-specification.md#数据可靠]
- [Source: ux-design-specification.md#莫兰迪暖色系设计系统]
- [Source: epics.md#Story 1.8]

### Common LLM Mistakes to Prevent

**避免以下常见错误：**

1. **不要忘记从config中读取version和updatedAt** - 配置文件已包含这些字段
2. **不要硬编码版本信息** - 从配置动态获取
3. **不要忘记计算过期状态** - 需要判断是否超过30天
4. **不要忘记应用莫兰迪暖色系** - 使用CSS变量，不要硬编码颜色值
5. **不要使用Primary色作为过期提示背景** - 过期提示使用Warning色(#E4C786)
6. **不要忘记错误处理** - 日期解析失败时不显示过期提示
7. **不要影响资源输入功能** - 版本信息只是显示，不影响核心功能
8. **不要忘记Console日志** - 关键操作需要记录日志

### Previous Story Context

**Story 1.7已实现：**
- pages/profile/profile.js个人中心页面
- 清除数据功能
- 二次确认对话框
- 数据清除后刷新首页

**Story 1.6已实现：**
- pages/planning/planning.js规划页面
- components/resource-input/资源输入组件
- 资源输入和自动保存功能
- 首页数据同步更新机制

**Story 1.5已实现：**
- pages/index/index.js首页页面
- components/overview-card/总览卡片组件
- components/game-card/游戏卡片组件
- 首页数据加载和显示

**Story 1.3已实现：**
- services/storage-service.js存储服务
- 数据持久化机制
- 版本迁移机制（CURRENT_VERSION常量）

**Story 1.2已实现：**
- config/config-loader.js配置加载器
- config/games/*.json游戏配置文件
- version和updatedAt字段已存在

**Story 1.8依赖：**
- gameService提供getGameConfig()方法
- 游戏配置文件包含version和updatedAt字段
- 规划页面已实现资源输入功能

### Next Story Context

**Story 2.1将依赖：**
- 游戏配置数据结构已完善
- 为概率计算引擎提供配置基础

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

待实现后填写。

### Completion Notes List

Story 1.8: 游戏数据版本查看已完成。

**实现内容：**
1. ✓ 实现版本信息显示 - 添加版本号和更新日期计算
2. ✓ 创建版本信息UI组件 - 版本信息区域+过期提示
3. ✓ 应用莫兰迪暖色系视觉风格 - CSS变量设计令牌
4. ✓ 验证版本信息功能 - Console输出测试结果

**关键技术实现：**
- 从游戏配置文件读取version和updatedAt字段
- 计算当前日期与更新日期的差值（天数）
- 差值 > 30天显示过期提示（Warning色背景）
- 版本信息区域使用Gray 100背景
- 过期提示使用Warning色(#E4C786)背景
- 错误处理：日期解析失败时不显示过期提示

**测试验证：**
```
规划页onShow
gameId: genshin
版本信息计算: {updatedAt: "2026-04-01", daysSinceUpdate: 3, isOutdated: false}
数据加载完成
```

**文件清单：**
- pages/planning/planning.js (修改) - 添加版本信息计算和显示
- pages/planning/planning.wxml (修改) - 添加版本信息UI
- pages/planning/planning.wxss (修改) - 添加版本信息样式

### File List

已创建的文件：
- pages/planning/planning.js (修改) - 添加版本信息计算和显示
- pages/planning/planning.wxml (修改) - 添加版本信息UI
- pages/planning/planning.wxss (修改) - 添加版本信息样式
