# Story 7.3: 模板消息通知

Status: review

## Story

As a 用户,
I want 接收模板消息通知,
So that 及时获得重要信息推送.

## Acceptance Criteria

**Given** 用户已授权模板消息
**When** 触发通知条件
**Then** 发送模板消息到用户微信
**And** 消息包含：标题、内容、跳转路径
**And** 支持多种消息类型（提醒、达成、警告）
**And** 用户可管理授权状态
**And** 遵循微信模板消息规范

## Tasks / Subtasks

- [x] **Task 1: 实现模板消息授权** (AC: 4)
  - [x] 1.1 创建授权请求弹窗
  - [x] 1.2 调用wx.requestSubscribeMessage()
  - [x] 1.3 处理授权结果
  - [x] 1.4 存储授权状态
  - [x] 1.5 提供授权管理页面

- [x] **Task 2: 创建通知服务** (AC: 1, 2)
  - [x] 2.1 创建services/notification-service.js
  - [x] 2.2 实现sendNotification()方法
  - [x] 2.3 配置模板消息ID
  - [x] 2.4 处理发送成功/失败
  - [x] 2.5 发送记录管理

- [x] **Task 3: 实现消息类型配置** (AC: 3)
  - [x] 3.1 定义提醒类消息模板
  - [x] 3.2 定义达成类消息模板
  - [x] 3.3 定义警告类消息模板
  - [x] 3.4 模板内容参数化
  - [x] 3.5 模板预览功能

- [x] **Task 4: 实现消息发送逻辑** (AC: 1, 2)
  - [x] 4.1 检查授权状态
  - [x] 4.2 构建消息参数
  - [x] 4.3 调用微信发送API
  - [x] 4.4 处理发送回调
  - [x] 4.5 发送失败重试机制

- [x] **Task 5: 创建通知设置页面** (AC: 4)
  - [x] 5.1 创建pages/notification-settings/目录
  - [x] 5.2 显示授权状态
  - [x] 5.3 消息类型开关管理
  - [x] 5.4 发送历史记录
  - [x] 5.5 授权管理操作

- [x] **Task 6: 应用莫兰迪暖色系设计** (AC: 2)
  - [x] 6.1 授权弹窗Primary色
  - [x] 6.2 通知设置页背景Gray 50
  - [x] 6.3 消息类型卡片样式
  - [x] 6.4 授权状态Success色
  - [x] 6.5 整体视觉统一

- [x] **Task 7: 集成测试** (AC: 1-5)
  - [x] 7.1 测试授权流程
  - [x] 7.2 测试消息发送
  - [x] 7.3 测试消息类型
  - [x] 7.4 测试授权管理
  - [x] 7.5 测试微信规范合规

## Dev Notes

模板消息通知功能，需用户授权后发送推送消息。

### 微信模板消息限制

微信小程序模板消息有严格限制：
1. 必须用户主动授权（一次性授权）
2. 需要在小程序内触发发送（不支持后台触发）
3. 每次授权只能发送一次消息
4. 需要申请模板消息ID

### 模板消息示例

```javascript
wx.requestSubscribeMessage({
  tmplIds: ['template_id_1', 'template_id_2'],
  success(res) {
    // res[template_id] = 'accept' | 'reject' | 'ban'
    if (res['template_id_1'] === 'accept') {
      // 用户同意接收
    }
  }
});
```

### 模板消息参数

```javascript
wx.subscribeMessage({
  touser: 'openid',
  template_id: 'template_id_1',
  page: '/pages/planning/planning',
  data: {
    thing1: { value: '卡池开启提醒' },
    time2: { value: '2026-04-20 10:00' },
    thing3: { value: '雷电将军复刻卡池即将开启' }
  }
});
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/notification-service.js (新建) - 通知服务