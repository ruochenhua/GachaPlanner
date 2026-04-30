# Story 4.7: 历史数据趋势图表

Status: ready-for-dev

## Story

As a 用户,
I want 看到历史数据趋势图,
So that 了解资源变化和规划习惯.

## Acceptance Criteria

**Given** 历史记录已包含时间序列数据
**When** 用户查看趋势分析
**Then** 显示资源变化曲线（近30天）
**And** 标记重要事件（卡池开启、抽卡结果）
**And** 显示规划频率趋势
**And** 图表可缩放查看细节
**And** 渲染性能 < 500ms

## Tasks / Subtasks

- [ ] **Task 1: 创建趋势图表组件** (AC: 1)
  - [ ] 1.1 创建components/history-trend-chart/目录
  - [ ] 1.2 创建history-trend-chart.js组件逻辑
  - [ ] 1.3 创建history-trend-chart.wxml模板
  - [ ] 1.4 创建history-trend-chart.wxss样式
  - [ ] 1.5 创建history-trend-chart.json配置

- [ ] **Task 2: 实现数据处理** (AC: 1)
  - [ ] 2.1 按时间聚合历史记录
  - [ ] 2.2 计算每日资源消耗
  - [ ] 2.3 生成时间序列数据
  - [ ] 2.4 处理数据空缺
  - [ ] 2.5 限制数据点数量

- [ ] **Task 3: 实现Canvas图表绘制** (AC: 1, 5)
  - [ ] 3.1 初始化Canvas 2D上下文
  - [ ] 3.2 绘制坐标轴
  - [ ] 3.3 绘制资源变化曲线
  - [ ] 3.4 绘制网格线
  - [ ] 3.5 确保渲染性能 < 500ms

- [ ] **Task 4: 实现事件标记** (AC: 2)
  - [ ] 4.1 识别重要事件点
  - [ ] 4.2 绘制事件标记圆点
  - [ ] 4.3 显示事件标签
  - [ ] 4.4 支持点击查看详情
  - [ ] 4.5 优化标记布局

- [ ] **Task 5: 实现规划频率趋势** (AC: 3)
  - [ ] 5.1 计算每日规划次数
  - [ ] 5.2 绘制频率柱状图或曲线
  - [ ] 5.3 显示频率数值
  - [ ] 5.4 与资源曲线联动
  - [ ] 5.5 图例说明

- [ ] **Task 6: 实现缩放功能** (AC: 4)
  - [ ] 6.1 支持双指缩放手势
  - [ ] 6.2 支持双击放大/缩小
  - [ ] 6.3 显示当前缩放比例
  - [ ] 6.4 缩放时更新数据点
  - [ ] 6.5 平滑缩放动画

- [ ] **Task 7: 应用莫兰迪暖色系设计** (AC: 1)
  - [ ] 7.1 曲线颜色Primary
  - [ ] 7.2 坐标轴Gray 200
  - [ ] 7.3 事件标记动态颜色
  - [ ] 7.4 背景Gray 50
  - [ ] 7.5 文字Gray 700

- [ ] **Task 8: 集成测试** (AC: 1-5)
  - [ ] 8.1 测试数据加载
  - [ ] 8.2 测试图表渲染
  - [ ] 8.3 测试事件标记
  - [ ] 8.4 测试缩放功能
  - [ ] 8.5 测试渲染性能

## Dev Notes

历史数据趋势图表组件，使用Canvas绘制资源变化曲线和规划频率趋势。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- components/history-trend-chart/history-trend-chart.js (新建) - 趋势图表逻辑
- components/history-trend-chart/history-trend-chart.wxml (新建) - 趋势图表模板
- components/history-trend-chart/history-trend-chart.wxss (新建) - 趋势图表样式
- components/history-trend-chart/history-trend-chart.json (新建) - 组件配置