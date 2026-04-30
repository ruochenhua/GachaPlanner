# Story 7.1: 卡池开启提醒

Status: review

## Story

As a 用户,
I want 设置卡池开启提醒,
So that 不错过心仪卡池的开启时间.

## Acceptance Criteria

**Given** 用户有心仪的卡池规划
**When** 用户设置卡池开启提醒
**Then** 提醒包含：卡池名称、开启时间、提前提醒时间
**And** 支持设置提前1天/3天/7天提醒
**And** 提醒时间可自定义
**And** 提醒存储在本地
**And** 用户可查看和管理提醒列表

## Tasks / Subtasks

- [x] **Task 1: 创建提醒服务** (AC: 1, 4)
  - [x] 1.1 创建services/reminder-service.js
  - [x] 1.2 实现createReminder()方法
  - [x] 1.3 实现getReminders()方法
  - [x] 1.4 实现updateReminder()方法
  - [x] 1.5 实现deleteReminder()方法

- [x] **Task 2: 实现卡池开启提醒设置** (AC: 1, 2)
  - [x] 2.1 选择卡池（从规划列表）
  - [x] 2.2 设置开启时间（日期选择器）
  - [x] 2.3 设置提前提醒时间（1天/3天/7天）
  - [x] 2.4 自定义提醒时间选项
  - [x] 2.5 提醒创建成功提示

- [x] **Task 3: 创建提醒管理页面** (AC: 5)
  - [x] 3.1 创建pages/reminder-list/目录
  - [x] 3.2 显示提醒列表
  - [x] 3.3 每条显示：卡池名称、开启时间、提前提醒时间
  - [x] 3.4 支持编辑和删除提醒
  - [x] 3.5 支持开启/关闭提醒开关

- [x] **Task 4: 实现提醒触发机制** (AC: 1)
  - [x] 4.1 本地定时检查提醒时间
  - [x] 4.2 小程序启动时检查到期提醒
  - [x] 4.3 显示提醒通知弹窗
  - [x] 4.4 提醒已触发后标记状态
  - [x] 4.5 提醒历史记录

- [x] **Task 5: 创建提醒设置组件** (AC: 1, 2, 3)
  - [x] 5.1 创建components/reminder-setter/目录
  - [x] 5.2 卡池选择器
  - [x] 5.3 日期时间选择器
  - [x] 5.4 提前时间选择器
  - [x] 5.5 保存按钮

- [x] **Task 6: 应用莫兰迪暖色系设计** (AC: 1)
  - [x] 6.1 提醒列表背景Gray 50
  - [x] 6.2 提醒卡片Primary边框
  - [x] 6.3 提醒时间Success色强调
  - [x] 6.4 提醒开关组件样式
  - [x] 6.5 整体视觉风格统一

- [x] **Task 7: 集成测试** (AC: 1-5)
  - [x] 7.1 测试提醒创建
  - [x] 7.2 测试提醒列表显示
  - [x] 7.3 测试提醒编辑删除
  - [x] 7.4 测试提醒触发
  - [x] 7.5 测试提醒管理

## Dev Notes

卡池开启提醒功能，帮助用户及时关注心仪卡池。

### 提醒数据结构

```javascript
{
  id: 'reminder_001',
  poolId: 'pool_genshin_001',
  poolName: '雷电将军复刻',
  gameId: 'genshin',
  openDate: '2026-04-20',
  reminderTime: '2026-04-19 09:00', // 提前1天
  advanceDays: 1, // 提前天数
  status: 'active', // active/fired/disabled
  createdAt: '2026-04-10T10:00:00',
  updatedAt: '2026-04-10T10:00:00'
}
```

### 微信小程序限制

微信小程序不支持后台定时任务，提醒机制需：
1. 用户打开小程序时检查提醒
2. 使用本地存储记录提醒状态
3. 无法实现真正的推送通知（需服务端支持）

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/reminder-service.js (新建) - 提醒服务
- components/reminder-setter/reminder-setter.js (新建) - 提醒设置组件
- components/reminder-setter/reminder-setter.wxml (新建)
- components/reminder-setter/reminder-setter.wxss (新建)
- components/reminder-setter/reminder-setter.json (新建)
- pages/reminder-list/reminder-list.js (新建) - 提醒列表页面
- pages/reminder-list/reminder-list.wxml (新建)
- pages/reminder-list/reminder-list.wxss (新建)
- pages/reminder-list/reminder-list.json (新建)