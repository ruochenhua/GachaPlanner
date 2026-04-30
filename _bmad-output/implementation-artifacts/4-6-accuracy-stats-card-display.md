# Story 4.6: 准确度统计卡片展示

Status: ready-for-dev

## Story

As a 用户,
I want 看到醒目的准确度统计卡片,
So that 快速了解工具可靠性.

## Acceptance Criteria

**Given** 准确度已计算
**When** 用户查看历史记录页
**Then** 顶部显示统计卡片
**And** 显示规划命中率（如85%）
**And** 显示成功率/失败次数（如17成功3失败）
**And** 颜色编码：≥95%绿色、80-95%黄色、<80%红色
**And** 显示趋势图标（上升/下降箭头）

## Tasks / Subtasks

- [ ] **Task 1: 创建统计卡片组件** (AC: 1, 2)
  - [ ] 1.1 创建components/accuracy-stats-card/目录
  - [ ] 1.2 创建accuracy-stats-card.js组件逻辑
  - [ ] 1.3 创建accuracy-stats-card.wxml模板
  - [ ] 1.4 创建accuracy-stats-card.wxss样式
  - [ ] 1.5 创建accuracy-stats-card.json配置

- [ ] **Task 2: 实现命中率展示** (AC: 2)
  - [ ] 2.1 大数字显示命中率
  - [ ] 2.2 显示百分比符号
  - [ ] 2.3 根据评级设置颜色
  - [ ] 2.4 添加数字动画效果
  - [ ] 2.5 显示评级文字

- [ ] **Task 3: 实现成功/失败统计** (AC: 3)
  - [ ] 3.1 显示成功次数
  - [ ] 3.2 显示失败次数
  - [ ] 3.3 显示总记录数
  - [ ] 3.4 使用图标辅助显示
  - [ ] 3.5 布局美观清晰

- [ ] **Task 4: 实现颜色编码** (AC: 4)
  - [ ] 4.1 ≥95%使用Success Green
  - [ ] 4.2 80-95%使用Warning Yellow
  - [ ] 4.3 <80%使用Danger Red
  - [ ] 4.4 动态切换颜色
  - [ ] 4.5 确保对比度合格

- [ ] **Task 5: 实现趋势显示** (AC: 5)
  - [ ] 5.1 计算近期趋势（最近10条）
  - [ ] 5.2 与之前趋势对比
  - [ ] 5.3 显示上升箭头
  - [ ] 5.4 显示下降箭头
  - [ ] 5.5 显示持平图标

- [ ] **Task 6: 实现动态更新** (AC: 1)
  - [ ] 6.1 监听统计数据变化
  - [ ] 6.2 数据变化时重新渲染
  - [ ] 6.3 平滑过渡动画
  - [ ] 6.4 处理空数据状态
  - [ ] 6.5 处理加载状态

- [ ] **Task 7: 应用莫兰迪暖色系设计** (AC: 1)
  - [ ] 7.1 卡片背景Gray 50
  - [ ] 7.2 卡片圆角12px
  - [ ] 7.3 阴影效果
  - [ ] 7.4 内边距16px
  - [ ] 7.5 响应式布局

- [ ] **Task 8: 集成测试** (AC: 1-5)
  - [ ] 8.1 测试命中率显示
  - [ ] 8.2 测试颜色编码
  - [ ] 8.3 测试趋势显示
  - [ ] 8.4 测试动态更新
  - [ ] 8.5 测试空数据状态

## Dev Notes

准确度统计卡片组件，在历史记录页顶部展示规划准确度统计信息。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- components/accuracy-stats-card/accuracy-stats-card.js (新建) - 统计卡片逻辑
- components/accuracy-stats-card/accuracy-stats-card.wxml (新建) - 统计卡片模板
- components/accuracy-stats-card/accuracy-stats-card.wxss (新建) - 统计卡片样式
- components/accuracy-stats-card/accuracy-stats-card.json (新建) - 组件配置
- pages/history/history.json (更新) - 引入统计卡片组件
- pages/history/history.wxml (更新) - 添加统计卡片展示
- pages/history/history.wxss (更新) - 添加统计区域样式