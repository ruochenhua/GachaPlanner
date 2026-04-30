# Story 4.3: 历史记录列表查看

Status: ready-for-dev

## Story

As a 用户,
I want 查看抽卡历史列表,
So that 回顾过往记录.

## Acceptance Criteria

**Given** 历史记录已保存
**When** 用户进入历史记录页
**Then** 显示历史记录列表（时间倒序）
**And** 每条记录显示：游戏、卡池、目标、预测概率、实际结果、时间
**And** 支持按游戏筛选
**And** 支持上拉加载更多（分页）
**And** 时间显示相对时间（"3小时前"）
**And** 列表滚动流畅度 > 50fps

## Tasks / Subtasks

- [ ] **Task 1: 创建历史记录页面** (AC: 1)
  - [ ] 1.1 创建pages/history/目录
  - [ ] 1.2 创建history.js页面逻辑
  - [ ] 1.3 创建history.wxml模板
  - [ ] 1.4 创建history.wxss样式
  - [ ] 1.5 创建history.json配置

- [ ] **Task 2: 创建历史记录卡片组件** (AC: 2)
  - [ ] 2.1 创建components/history-card/目录
  - [ ] 2.2 显示游戏名称和图标
  - [ ] 2.3 显示卡池名称
  - [ ] 2.4 显示预测概率和实际结果
  - [ ] 2.5 显示相对时间

- [ ] **Task 3: 实现列表加载** (AC: 1, 2)
  - [ ] 3.1 页面加载时获取历史记录
  - [ ] 3.2 调用history-service.loadHistory()
  - [ ] 3.3 渲染记录列表
  - [ ] 3.4 处理空数据状态
  - [ ] 3.5 处理加载错误

- [ ] **Task 4: 实现游戏筛选** (AC: 3)
  - [ ] 4.1 创建游戏筛选下拉框
  - [ ] 4.2 加载游戏列表
  - [ ] 4.3 筛选变化时重新加载
  - [ ] 4.4 显示筛选结果数量
  - [ ] 4.5 支持清除筛选

- [ ] **Task 5: 实现分页加载** (AC: 4)
  - [ ] 5.1 实现上拉加载更多
  - [ ] 5.2 显示加载状态
  - [ ] 5.3 判断是否还有更多数据
  - [ ] 5.4 显示"没有更多了"提示
  - [ ] 5.5 优化滚动性能

- [ ] **Task 6: 实现相对时间显示** (AC: 5)
  - [ ] 6.1 创建时间格式化工具
  - [ ] 6.2 计算"刚刚"、"X分钟前"
  - [ ] 6.3 计算"X小时前"、"X天前"
  - [ ] 6.4 超过7天显示日期
  - [ ] 6.5 动态更新时间显示

- [ ] **Task 7: 优化滚动性能** (AC: 6)
  - [ ] 7.1 使用虚拟列表（可选）
  - [ ] 7.2 图片懒加载
  - [ ] 7.3 减少重渲染
  - [ ] 7.4 监控滚动帧率
  - [ ] 7.5 确保流畅度 > 50fps

- [ ] **Task 8: 集成测试** (AC: 1-6)
  - [ ] 8.1 测试列表显示
  - [ ] 8.2 测试游戏筛选
  - [ ] 8.3 测试分页加载
  - [ ] 8.4 测试相对时间
  - [ ] 8.5 测试滚动性能

## Dev Notes

历史记录列表页面，展示用户的抽卡历史，支持筛选和分页。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- utils/time.js (新建) - 时间格式化工具
- components/history-card/history-card.js (新建) - 卡片组件逻辑
- components/history-card/history-card.wxml (新建) - 卡片模板
- components/history-card/history-card.wxss (新建) - 卡片样式
- components/history-card/history-card.json (新建) - 组件配置
- pages/history/history.js (更新) - 历史页面逻辑
- pages/history/history.wxml (更新) - 历史页面模板
- pages/history/history.wxss (更新) - 历史页面样式
- pages/history/history.json (更新) - 页面配置