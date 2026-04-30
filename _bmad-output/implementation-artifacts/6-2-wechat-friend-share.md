# Story 6.2: 微信好友分享功能

Status: review

## Story

As a 用户,
I want 分享规划结果到微信好友,
So that 与朋友交流我的抽卡规划.

## Acceptance Criteria

**Given** 规划结果图片已生成
**When** 用户点击分享好友按钮
**Then** 调用微信分享API
**And** 分享卡片包含：标题、描述、缩略图
**And** 分享内容可自定义（游戏、卡池、概率）
**And** 分享成功显示Toast提示
**And** 支持分享给单个好友或群聊

## Tasks / Subtasks

- [x] **Task 1: 创建分享服务** (AC: 1)
  - [x] 1.1 创建services/share-service.js
  - [x] 1.2 实现shareToFriend()方法
  - [x] 1.3 配置分享卡片参数
  - [x] 1.4 处理分享成功/失败回调
  - [x] 1.5 导出服务模块

- [x] **Task 2: 实现分享卡片配置** (AC: 2, 3)
  - [x] 2.1 定义分享标题模板
  - [x] 2.2 定义分享描述模板
  - [x] 2.3 生成分享缩略图
  - [x] 2.4 支持自定义分享内容
  - [x] 2.5 分享卡片预览功能

- [x] **Task 3: 实现微信分享API调用** (AC: 1, 4)
  - [x] 3.1 调用wx.shareAppMessage()
  - [x] 3.2 配置分享参数
  - [x] 3.3 处理分享成功回调
  - [x] 3.4 处理分享失败回调
  - [x] 3.5 显示分享结果提示

- [x] **Task 4: 实现分享按钮组件** (AC: 1)
  - [x] 4.1 创建components/share-btn/目录
  - [x] 4.2 添加分享好友按钮
  - [x] 4.3 添加分享朋友圈按钮（可选）
  - [x] 4.4 显示分享状态
  - [x] 4.5 支持自定义分享参数

- [x] **Task 5: 实现分享内容编辑** (AC: 3)
  - [x] 5.1 创建分享内容编辑弹窗
  - [x] 5.2 编辑分享标题
  - [x] 5.3 编辑分享描述
  - [x] 5.4 选择缩略图样式
  - [x] 5.5 保存分享模板偏好

- [x] **Task 6: 应用莫兰迪暖色系设计** (AC: 2)
  - [x] 6.1 分享按钮Primary色
  - [x] 6.2 分享卡片背景Gray 50
  - [x] 6.3 分享预览框样式
  - [x] 6.4 分享成功Toast样式
  - [x] 6.5 与整体设计风格统一

- [x] **Task 7: 集成测试** (AC: 1-5)
  - [x] 7.1 测试分享API调用
  - [x] 7.2 测试分享卡片内容
  - [x] 7.3 测试分享成功提示
  - [x] 7.4 测试自定义分享
  - [x] 7.5 测试分享失败处理

## Dev Notes

微信好友分享功能，通过微信小程序API分享规划结果。

### 分享卡片配置

```javascript
{
  title: '原神雷电将军复刻规划 - 65%达成概率',
  path: '/pages/planning/planning?gameId=genshin&poolId=...',
  imageUrl: '/assets/share-images/planning-share.png', // 或动态生成的图片
  success: function(res) {
    wx.showToast({
      title: '分享成功',
      icon: 'success'
    });
  }
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/share-service.js (新建) - 分享服务
- components/share-btn/share-btn.js (新建) - 分享按钮组件
- components/share-btn/share-btn.wxml (新建)
- components/share-btn/share-btn.wxss (新建)
- components/share-btn/share-btn.json (新建)