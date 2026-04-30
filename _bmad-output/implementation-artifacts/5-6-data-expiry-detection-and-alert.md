# Story 5.6: 数据过期检测与提示

Status: ready-for-dev

## Story

As a 用户,
I want 在数据过期时收到提示,
So that 及时核对官方公告.

## Acceptance Criteria

**Given** 游戏配置包含更新日期
**When** 数据超过30天未更新
**Then** 游戏详情页显示过期提示
**And** 提示文字："数据可能过期（超过30天），请核对官方公告"
**And** 提示醒目但不阻塞操作
**And** 可关闭提示
**And** 提示颜色为警告黄色

## Tasks / Subtasks

- [ ] **Task 1: 实现过期检测逻辑** (AC: 1)
  - [ ] 1.1 创建utils/data-expiry-checker.js
  - [ ] 1.2 计算距上次更新的天数
  - [ ] 1.3 定义过期阈值（30天）
  - [ ] 1.4 返回过期检测结果
  - [ ] 1.5 支持配置过期阈值

- [ ] **Task 2: 创建过期提示组件** (AC: 2, 5)
  - [ ] 2.1 创建components/expiry-warning/目录
  - [ ] 2.2 显示警告图标和提示文字
  - [ ] 2.3 应用警告黄色配色
  - [ ] 2.4 支持关闭按钮
  - [ ] 2.5 关闭状态持久化

- [ ] **Task 3: 集成到游戏详情页** (AC: 1, 3)
  - [ ] 3.1 在游戏详情页检测过期
  - [ ] 3.2 过期时显示警告组件
  - [ ] 3.3 提示不阻塞操作
  - [ ] 3.4 提醒醒目但不突兀
  - [ ] 3.5 关闭后不再显示（当天）

- [ ] **Task 4: 实现关闭提示功能** (AC: 4)
  - [ ] 4.1 记录用户关闭提示
  - [ ] 4.2 关闭状态本地存储
  - [ ] 4.3 关闭后当天不再显示
  - [ ] 4.4 下次打开恢复显示（若仍过期）
  - [ ] 4.5 支持重新显示已关闭提示

- [ ] **Task 5: 应用莫兰迪暖色系设计** (AC: 2, 5)
  - [ ] 5.1 警告背景Warning Yellow浅色
  - [ ] 5.2 警告图标Warning Yellow深色
  - [ ] 5.3 文字Gray 700
  - [ ] 5.4 关闭按钮Gray 500
  - [ ] 5.5 确保对比度合格

- [ ] **Task 6: 集成测试** (AC: 1-5)
  - [ ] 6.1 测试过期检测
  - [ ] 6.2 测试提示显示
  - [ ] 6.3 测试提示关闭
  - [ ] 6.4 测试关闭状态持久
  - [ ] 6.5 测试过期后恢复显示

## Dev Notes

数据过期检测与提示，当游戏数据超过30天未更新时提醒用户。

### 过期检测算法

```javascript
function checkDataExpiry(updatedAt, thresholdDays = 30) {
  const now = new Date();
  const updateDate = new Date(updatedAt);
  const daysSinceUpdate = Math.floor((now - updateDate) / (24 * 60 * 60 * 1000));
  
  return {
    isExpired: daysSinceUpdate > thresholdDays,
    daysSinceUpdate,
    thresholdDays,
    message: `数据已${daysSinceUpdate}天未更新，请核对官方公告`
  };
}
```

### 警告提示样式

```
┌───────────────────────────────────┐
│ ⚠️ 数据可能过期（超过30天）        │
│ 请核对官方公告确认概率参数        │
│                            [关闭] │
└───────────────────────────────────┘
```

### 关闭状态存储

```javascript
// 存储结构
const dismissedWarnings = {
  gameId: {
    dismissedAt: timestamp,  // 关闭时间
    dismissedUntil: timestamp // 不再显示截止时间
  }
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- utils/data-expiry-checker.js (新建) - 数据过期检测工具
- components/expiry-warning/expiry-warning.js (新建) - 过期警告组件
- components/expiry-warning/expiry-warning.wxml (新建) - 过期警告模板
- components/expiry-warning/expiry-warning.wxss (新建) - 过期警告样式
- components/expiry-warning/expiry-warning.json (新建) - 组件配置

- utils/data-expiry-checker.js (新建) - 数据过期检测工具