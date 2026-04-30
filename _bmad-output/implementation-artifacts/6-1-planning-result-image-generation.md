# Story 6.1: 规划结果图片生成

Status: review

## Story

As a 用户,
I want 生成包含概率、建议、图表的规划结果图片,
So that 方便保存和分享我的抽卡规划.

## Acceptance Criteria

**Given** 规划计算已完成
**When** 用户点击生成图片按钮
**Then** 图片包含：概率数字、风险等级、建议内容、图表截图
**And** 图片尺寸适配微信分享（750x1334或自定义）
**And** 图片包含游戏标识和品牌水印
**And** 生成响应时间 < 2秒
**And** 图片可保存到本地相册

## Tasks / Subtasks

- [x] **Task 1: 创建图片生成服务** (AC: 1)
  - [x] 1.1 创建services/image-generator.js
  - [x] 1.2 实现generatePlanningImage()方法
  - [x] 1.3 使用Canvas API绘制内容
  - [x] 1.4 处理图片尺寸和布局
  - [x] 1.5 导出服务模块

- [x] **Task 2: 设计图片布局模板** (AC: 1, 2)
  - [x] 2.1 定义图片布局结构
  - [x] 2.2 概率区域设计（大数字+颜色）
  - [x] 2.3 建议区域设计（卡片样式）
  - [x] 2.4 图表区域设计（曲线图）
  - [x] 2.5 底部品牌区域设计

- [x] **Task 3: 实现Canvas绘制** (AC: 1, 3)
  - [x] 3.1 创建Canvas 2D上下文
  - [x] 3.2 绘制概率数字和颜色编码
  - [x] 3.3 绘制建议内容卡片
  - [x] 3.4 绘制概率分布曲线图
  - [x] 3.5 绘制游戏图标和水印

- [x] **Task 4: 实现图表截图功能** (AC: 1)
  - [x] 4.1 从现有图表组件获取数据
  - [x] 4.2 在Canvas中绘制图表
  - [x] 4.3 保持图表样式一致性
  - [x] 4.4 处理图表数据点数量限制
  - [x] 4.5 图表颜色与莫兰迪暖色系一致

- [x] **Task 5: 实现图片保存功能** (AC: 5)
  - [x] 5.1 Canvas导出为图片文件
  - [x] 5.2 调用wx.saveImageToPhotosAlbum()
  - [x] 5.3 处理保存权限请求
  - [x] 5.4 显示保存成功/失败提示
  - [x] 5.5 生成响应时间优化 < 2秒

- [x] **Task 6: 创建生成按钮组件** (AC: 1)
  - [x] 6.1 创建components/image-generate-btn/目录
  - [x] 6.2 添加生成图片按钮
  - [x] 6.3 显示生成进度状态
  - [x] 6.4 生成完成后显示预览
  - [x] 6.5 支持重新生成

- [x] **Task 7: 应用莫兰迪暖色系设计** (AC: 1, 3)
  - [x] 7.1 图片背景色Gray 50
  - [x] 7.2 概率数字颜色动态（绿/黄/红）
  - [x] 7.3 建议卡片Primary色边框
  - [x] 7.4 品牌水印Primary色
  - [x] 7.5 整体视觉风格统一

- [x] **Task 8: 集成测试** (AC: 1-5)
  - [x] 8.1 测试图片生成
  - [x] 8.2 测试图片布局
  - [x] 8.3 测试图表绘制
  - [x] 8.4 测试图片保存
  - [x] 8.5 测试生成性能

## Dev Notes

规划结果图片生成，用于保存和分享用户的抽卡规划。

### 图片布局设计

```
┌─────────────────────────────────┐
│ [游戏图标] 抽卡规划             │
│ ─────────────────────────────── │
│                                 │
│        65%                      │
│    [风险等级：中等]              │
│                                 │
│ ─────────────────────────────── │
│ 💡 建议：建议囤积20天后再抽取    │
│                                 │
│ ─────────────────────────────── │
│ [概率分布曲线图]                │
│                                 │
│ ─────────────────────────────── │
│ GachaPlaner · 原神 v1.0.0       │
└─────────────────────────────────┘
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/image-generator.js (新建) - 图片生成服务
- components/image-generate-btn/image-generate-btn.js (新建) - 图片生成按钮组件
- components/image-generate-btn/image-generate-btn.wxml (新建)
- components/image-generate-btn/image-generate-btn.wxss (新建)
- components/image-generate-btn/image-generate-btn.json (新建)