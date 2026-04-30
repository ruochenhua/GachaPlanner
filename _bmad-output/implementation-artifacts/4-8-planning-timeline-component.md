# Story 4.8: 规划时间轴组件实现

Status: ready-for-dev

## Story

As a 用户,
I want 看到规划时间轴,
So that 了解未来规划安排.

## Acceptance Criteria

**Given** 多卡池规划已创建
**When** 实现时间轴组件
**Then** 横向时间轴展示规划节点
**And** 节点显示：日期、游戏、达成概率
**And** 左右滑动查看更多
**And** 点击节点跳转对应规划详情
**And** 过去节点灰色、当前节点高亮、未来节点标准色

## Tasks / Subtasks

- [ ] **Task 1: 创建时间轴组件** (AC: 1)
  - [ ] 1.1 创建components/planning-timeline/目录
  - [ ] 1.2 创建planning-timeline.js组件逻辑
  - [ ] 1.3 创建planning-timeline.wxml模板
  - [ ] 1.4 创建planning-timeline.wxss样式
  - [ ] 1.5 创建planning-timeline.json配置

- [ ] **Task 2: 定义组件属性和数据** (AC: 1, 2)
  - [ ] 2.1 定义plans属性接收规划数据
  - [ ] 2.2 定义内部节点数据结构
  - [ ] 2.3 处理时间排序
  - [ ] 2.4 计算节点位置
  - [ ] 2.5 识别节点状态（过去/当前/未来）

- [ ] **Task 3: 实现横向滚动** (AC: 3)
  - [ ] 3.1 使用scroll-view实现横向滚动
  - [ ] 3.2 计算滚动区域宽度
  - [ ] 3.3 设置初始滚动位置
  - [ ] 3.4 滚动指示器
  - [ ] 3.5 平滑滚动动画

- [ ] **Task 4: 实现节点展示** (AC: 2)
  - [ ] 4.1 显示日期标签
  - [ ] 4.2 显示游戏图标
  - [ ] 4.3 显示达成概率
  - [ ] 4.4 显示卡池名称
  - [ ] 4.5 节点布局优化

- [ ] **Task 5: 实现节点状态样式** (AC: 5)
  - [ ] 5.1 过去节点灰色显示
  - [ ] 5.2 当前节点高亮显示
  - [ ] 5.3 未来节点标准色显示
  - [ ] 5.4 动态计算节点状态
  - [ ] 5.5 状态切换动画

- [ ] **Task 6: 实现节点点击** (AC: 4)
  - [ ] 6.1 添加点击事件处理
  - [ ] 6.2 触发节点点击事件
  - [ ] 6.3 传递节点数据
  - [ ] 6.4 点击反馈效果
  - [ ] 6.5 支持跳转规划详情

- [ ] **Task 7: 应用莫兰迪暖色系设计** (AC: 1)
  - [ ] 7.1 时间轴线Gray 200
  - [ ] 7.2 节点圆点Primary色
  - [ ] 7.3 当前节点Success Green
  - [ ] 7.4 过去节点Gray 400
  - [ ] 7.5 文字Gray 700

- [ ] **Task 8: 集成测试** (AC: 1-5)
  - [ ] 8.1 测试节点显示
  - [ ] 8.2 测试横向滚动
  - [ ] 8.3 测试节点状态
  - [ ] 8.4 测试点击事件
  - [ ] 8.5 测试动态更新

## Dev Notes

规划时间轴组件，横向展示多卡池规划的时间节点。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- components/planning-timeline/planning-timeline.js (新建) - 时间轴组件逻辑
- components/planning-timeline/planning-timeline.wxml (新建) - 时间轴组件模板
- components/planning-timeline/planning-timeline.wxss (新建) - 时间轴组件样式
- components/planning-timeline/planning-timeline.json (新建) - 组件配置