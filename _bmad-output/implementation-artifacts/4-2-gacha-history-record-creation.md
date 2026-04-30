# Story 4.2: 抽卡历史记录创建

Status: ready-for-dev

## Story

As a 用户,
I want 记录抽卡结果,
So that 追踪历史和验证规划准确度.

## Acceptance Criteria

**Given** 历史记录服务已实现
**And** 用户完成抽卡
**When** 用户添加历史记录
**Then** 可选择游戏和卡池
**And** 可输入抽卡结果（成功/失败）
**And** 可输入消耗资源数量
**And** 系统自动关联规划记录（如有）
**And** 记录保存成功显示Toast提示

## Tasks / Subtasks

- [ ] **Task 1: 创建历史记录表单组件** (AC: 1, 2, 3)
  - [ ] 1.1 创建components/history-form/目录
  - [ ] 1.2 创建history-form.js组件逻辑
  - [ ] 1.3 创建history-form.wxml模板
  - [ ] 1.4 创建history-form.wxss样式
  - [ ] 1.5 创建history-form.json配置

- [ ] **Task 2: 实现游戏和卡池选择** (AC: 1)
  - [ ] 2.1 加载游戏列表数据
  - [ ] 2.2 实现游戏选择下拉框
  - [ ] 2.3 根据游戏加载卡池列表
  - [ ] 2.4 实现卡池选择下拉框
  - [ ] 2.5 支持自定义卡池名称

- [ ] **Task 3: 实现抽卡结果输入** (AC: 2, 3)
  - [ ] 3.1 实现成功/失败切换按钮
  - [ ] 3.2 实现抽数输入框
  - [ ] 3.3 实现资源消耗输入框
  - [ ] 3.4 实现目标选择（如满命）
  - [ ] 3.5 输入验证和提示

- [ ] **Task 4: 实现规划记录关联** (AC: 4)
  - [ ] 4.1 检查是否有匹配的规划记录
  - [ ] 4.2 自动填充预测概率
  - [ ] 4.3 显示关联的规划信息
  - [ ] 4.4 支持手动解除关联
  - [ ] 4.5 保存关联关系

- [ ] **Task 5: 实现保存功能** (AC: 5)
  - [ ] 5.1 调用history-service.saveRecord()
  - [ ] 5.2 处理保存成功
  - [ ] 5.3 显示Toast提示
  - [ ] 5.4 触发记录创建事件
  - [ ] 5.5 处理保存失败

- [ ] **Task 6: 应用莫兰迪暖色系设计** (AC: 1)
  - [ ] 6.1 表单背景色Gray 50
  - [ ] 6.2 成功按钮Success Green
  - [ ] 6.3 失败按钮Danger Red
  - [ ] 6.4 输入框边框Gray 200
  - [ ] 6.5 标签文字Gray 700

- [ ] **Task 7: 集成测试** (AC: 1-5)
  - [ ] 7.1 测试游戏选择
  - [ ] 7.2 测试结果输入
  - [ ] 7.3 测试规划关联
  - [ ] 7.4 测试保存功能
  - [ ] 7.5 测试Toast提示

## Dev Notes

历史记录创建表单组件，用于用户添加新的抽卡历史记录。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- components/history-form/history-form.js (新建) - 表单组件逻辑
- components/history-form/history-form.wxml (新建) - 表单模板
- components/history-form/history-form.wxss (新建) - 表单样式
- components/history-form/history-form.json (新建) - 组件配置