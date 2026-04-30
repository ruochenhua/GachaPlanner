# Story 4.4: 历史记录编辑与删除

Status: ready-for-dev

## Story

As a 用户,
I want 编辑和删除历史记录,
So that 修正错误或清理数据.

## Acceptance Criteria

**Given** 历史记录列表已显示
**When** 用户点击记录进入详情或左滑
**Then** 显示编辑/删除操作按钮
**And** 编辑时可修改所有字段
**And** 删除时二次确认
**And** 操作成功后列表自动更新
**And** 操作可撤销（删除后30秒内可恢复）

## Tasks / Subtasks

- [ ] **Task 1: 创建历史记录详情页** (AC: 1, 2)
  - [ ] 1.1 创建pages/history-detail/目录
  - [ ] 1.2 显示记录完整信息
  - [ ] 1.3 添加编辑/删除按钮
  - [ ] 1.4 实现编辑模式切换
  - [ ] 1.5 实现保存/取消操作

- [ ] **Task 2: 实现左滑操作** (AC: 1)
  - [ ] 2.1 在列表项添加左滑手势
  - [ ] 2.2 显示操作按钮（编辑/删除）
  - [ ] 2.3 处理滑动动画
  - [ ] 2.4 点击其他区域收起
  - [ ] 2.5 限制滑动距离

- [ ] **Task 3: 实现编辑功能** (AC: 2)
  - [ ] 3.1 加载记录数据到表单
  - [ ] 3.2 允许修改所有字段
  - [ ] 3.3 验证修改内容
  - [ ] 3.4 调用history-service.updateRecord()
  - [ ] 3.5 更新列表显示

- [ ] **Task 4: 实现删除功能** (AC: 3)
  - [ ] 4.1 显示删除确认对话框
  - [ ] 4.2 确认后调用history-service.deleteRecord()
  - [ ] 4.3 从列表移除记录
  - [ ] 4.4 显示删除成功提示
  - [ ] 4.5 触发撤销恢复机制

- [ ] **Task 5: 实现撤销恢复** (AC: 5)
  - [ ] 5.1 删除后显示撤销Toast
  - [ ] 5.2 30秒内可点击撤销
  - [ ] 5.3 撤销时恢复记录
  - [ ] 5.4 超时后真正删除
  - [ ] 5.5 处理页面离开场景

- [ ] **Task 6: 实现列表自动更新** (AC: 4)
  - [ ] 6.1 编辑后更新对应记录
  - [ ] 6.2 删除后移除对应记录
  - [ ] 6.3 使用事件通知列表刷新
  - [ ] 6.4 保持列表滚动位置
  - [ ] 6.5 动画过渡效果

- [ ] **Task 7: 应用莫兰迪暖色系设计** (AC: 1)
  - [ ] 7.1 编辑按钮Primary色
  - [ ] 7.2 删除按钮Danger色
  - [ ] 7.3 确认对话框样式
  - [ ] 7.4 撤销Toast样式
  - [ ] 7.5 操作按钮触摸目标

- [ ] **Task 8: 集成测试** (AC: 1-5)
  - [ ] 8.1 测试左滑操作
  - [ ] 8.2 测试编辑功能
  - [ ] 8.3 测试删除功能
  - [ ] 8.4 测试撤销恢复
  - [ ] 8.5 测试列表更新

## Dev Notes

历史记录编辑与删除功能，支持详情页编辑和列表左滑操作。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- pages/history-detail/history-detail.js (新建) - 详情页逻辑
- pages/history-detail/history-detail.wxml (新建) - 详情页模板
- pages/history-detail/history-detail.wxss (新建) - 详情页样式
- pages/history-detail/history-detail.json (新建) - 页面配置