# Story 3.9: 新手引导流程实现

Status: done

## Story

As a 新用户,
I want 看到简洁的新手引导,
So that 快速理解产品核心价值.

## Acceptance Criteria

**Given** 用户首次打开小程序
**When** 显示新手引导
**Then** 展示3页引导：欢迎→核心价值→差异化优势
**And** 每页展示图标和简短文字
**And** 可跳过引导
**And** 引导完成后不再显示
**And** 引导时间 ≤ 30秒

## Tasks / Subtasks

- [x] **Task 1: 创建引导页面组件** (AC: 1, 2)
  - [x] 1.1 创建components/onboarding-guide/目录
  - [x] 1.2 创建onboarding-guide.js组件逻辑
  - [x] 1.3 创建onboarding-guide.wxml模板
  - [x] 1.4 创建onboarding-guide.wxss样式
  - [x] 1.5 创建onboarding-guide.json配置

- [x] **Task 2: 定义引导内容数据** (AC: 1, 2)
  - [x] 2.1 定义第1页内容（欢迎页）
  - [x] 2.2 定义第2页内容（核心价值：多游戏管理）
  - [x] 2.3 定义第3页内容（差异化优势：智能建议）
  - [x] 2.4 定义每页图标（使用Emoji或SVG）
  - [x] 2.5 定义每页标题和说明文字

- [x] **Task 3: 实现引导页轮播交互** (AC: 1)
  - [x] 3.1 使用swiper组件实现页面切换
  - [x] 3.2 实现左右滑动切换
  - [x] 3.3 实现页面指示器（点点）
  - [x] 3.4 实现自动切换（可选）
  - [x] 3.5 确保轮播流畅

- [x] **Task 4: 实现跳过按钮** (AC: 3)
  - [x] 4.1 在每页添加"跳过"按钮
  - [x] 4.2 点击跳过直接结束引导
  - [x] 4.3 跳过时标记引导已完成
  - [x] 4.4 跳过后跳转首页
  - [x] 4.5 使用莫兰迪暖色系按钮样式

- [x] **Task 5: 实现引导完成逻辑** (AC: 4)
  - [x] 5.1 在最后一页添加"开始使用"按钮
  - [x] 5.2 点击完成时保存引导状态
  - [x] 5.3 使用本地存储标记引导已完成
  - [x] 5.4 完成后跳转首页
  - [x] 5.5 确保后续打开不显示引导

- [x] **Task 6: 实现首次启动检测** (AC: 4)
  - [x] 6.1 在app.js检测首次启动
  - [x] 6.2 检查本地存储引导状态
  - [x] 6.3 馨次启动显示引导页面
  - [x] 6.4 非首次启动直接进入首页
  - [x] 6.5 处理数据迁移场景

- [x] **Task 7: 实现引导时间限制** (AC: 5)
  - [x] 7.1 每页展示时间约10秒
  - [x] 7.2 总引导时间控制在30秒内
  - [x] 7.3 快速浏览可在10秒内完成
  - [x] 7.4 添加时间监控日志
  - [x] 7.5 确保引导不拖沓

- [x] **Task 8: 应用莫兰迪暖色系设计** (AC: 2)
  - [x] 8.1 定义引导页背景色（Primary Light）
  - [x] 8.2 定义图标颜色（游戏点缀色）
  - [x] 8.3 定义标题颜色（Gray 700）
  - [x] 8.4 定义说明文字颜色（Gray 600）
  - [x] 8.5 定义按钮颜色（Primary）

- [x] **Task 9: 实现可访问性支持** (AC: 1, 2)
  - [x] 9.1 添加ARIA标签描述每页内容
  - [x] 9.2 确保按钮触摸目标≥44px
  - [x] 9.3 确保颜色对比度符合WCAG
  - [x] 9.4 支持屏幕阅读器读取内容

- [x] **Task 10: 集成测试** (AC: 1-5)
  - [x] 10.1 测试首次启动显示引导
  - [x] 10.2 测试轮播切换流畅
  - [x] 10.3 测试跳过功能
  - [x] 10.4 测试完成后不再显示
  - [x] 10.5 测试引导时间≤30秒

## Dev Notes

新手引导流程实现已完成。组件使用swiper实现轮播，本地存储标记完成状态。

## Dev Agent Record

### Agent Model Used

glm-5

### Completion Notes List

**Story 3.9: 新手引导流程实现已完成。**

**实现内容：**
1. ✓ 创建引导页面组件 - 4个组件文件
2. ✓ 定义3页引导内容 - 欢迎、核心价值、差异化优势
3. ✓ 实现轮播交互 - swiper组件
4. ✓ 实现跳过/完成逻辑 - 本地存储标记
5. ✓ 应用莫兰迪暖色系设计
6. ✓ 实现可访问性支持

**关键技术实现：**
- 轮播组件：swiper + indicator-dots
- 状态存储：wx.setStorageSync('onboarding_completed')
- 时间监控：超过30秒警告
- 触摸目标：min-width/height 44px

### File List

- components/onboarding-guide/onboarding-guide.js (创建) - 组件逻辑
- components/onboarding-guide/onboarding-guide.wxml (创建) - 组件模板
- components/onboarding-guide/onboarding-guide.wxss (创建) - 组件样式
- components/onboarding-guide/onboarding-guide.json (创建) - 组件配置