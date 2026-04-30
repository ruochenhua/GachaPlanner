# Story 7.2: 资源囤积提醒

Status: review

## Story

As a 用户,
I want 设置资源囤积提醒,
So that 提醒自己积累足够资源后再抽取.

## Acceptance Criteria

**Given** 用户有资源囤积计划
**When** 用户设置资源囤积提醒
**Then** 提醒包含：目标资源数量、当前进度、提醒阈值
**And** 支持设置达成目标时的提醒
**And** 支持设置每周/每月定期提醒
**And** 提醒显示囤积进度
**And** 用户可查看和管理囤积提醒

## Tasks / Subtasks

- [x] **Task 1: 扩展提醒服务** (AC: 1, 4)
  - [x] 1.1 扩展services/reminder-service.js
  - [x] 1.2 实现createHoardingReminder()方法
  - [x] 1.3 实现getHoardingReminders()方法
  - [x] 1.4 实现updateHoardingReminder()方法
  - [x] 1.5 实现deleteHoardingReminder()方法

- [x] **Task 2: 实现资源囤积提醒设置** (AC: 1, 2)
  - [x] 2.1 设置目标资源数量
  - [x] 2.2 设置当前资源数量
  - [x] 2.3 设置提醒阈值（达成目标时提醒）
  - [x] 2.4 设置定期提醒（每周/每月）
  - [x] 2.5 提醒创建成功提示

- [x] **Task 3: 实现囤积进度追踪** (AC: 3)
  - [x] 3.1 计算囤积进度百分比
  - [x] 3.2 显示进度条可视化
  - [x] 3.3 计算还需囤积数量
  - [x] 3.4 进度颜色编码（<50%红/50-80%黄/>80%绿）
  - [x] 3.5 进度更新通知

- [x] **Task 4: 创建囤积提醒组件** (AC: 1, 2, 3)
  - [x] 4.1 创建components/hoarding-reminder/目录
  - [x] 4.2 目标资源输入
  - [x] 4.3 当前进度显示
  - [x] 4.4 提醒阈值选择
  - [x] 4.5 定期提醒选择

- [x] **Task 5: 实现囤积提醒触发** (AC: 2)
  - [x] 5.1 检查资源达到目标时触发
  - [x] 5.2 定期提醒时间检查
  - [x] 5.3 显示囤积进度提醒
  - [x] 5.4 提醒弹窗样式
  - [x] 5.5 提醒历史记录

- [x] **Task 6: 应用莫兰迪暖色系设计** (AC: 3)
  - [x] 6.1 进度条Primary色
  - [x] 6.2 进度背景Gray 200
  - [x] 6.3 目标达成Success色
  - [x] 6.4 提醒卡片样式
  - [x] 6.5 整体视觉统一

- [x] **Task 7: 集成测试** (AC: 1-5)
  - [x] 7.1 测试囤积提醒创建
  - [x] 7.2 测试进度追踪
  - [x] 7.3 测试目标达成提醒
  - [x] 7.4 测试定期提醒
  - [x] 7.5 测试提醒管理

## Dev Notes

资源囤积提醒功能，帮助用户追踪资源积累进度。

### 囤积提醒数据结构

```javascript
{
  id: 'hoarding_001',
  gameId: 'genshin',
  gameName: '原神',
  targetResource: 160, // 目标抽数
  currentResource: 80, // 当前抽数
  reminderThreshold: 150, // 提醒阈值
  periodicReminder: 'weekly', // weekly/monthly/none
  status: 'active',
  createdAt: '2026-04-10T10:00:00',
  updatedAt: '2026-04-10T10:00:00'
}
```

### 进度计算

```javascript
const progress = (currentResource / targetResource) * 100;
// progress: 50% (80/160)
// 还需囤积: targetResource - currentResource = 80抽
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/reminder-service.js (已更新) - 添加囤积提醒方法
- components/hoarding-reminder/hoarding-reminder.js (新建) - 囤积提醒组件
- components/hoarding-reminder/hoarding-reminder.wxml (新建)
- components/hoarding-reminder/hoarding-reminder.wxss (新建)
- components/hoarding-reminder/hoarding-reminder.json (新建)