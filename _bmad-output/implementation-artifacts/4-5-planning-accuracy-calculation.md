# Story 4.5: 规划准确度计算

Status: ready-for-dev

## Story

As a 用户,
I want 看到规划准确度统计,
So that 了解工具的可靠性.

## Acceptance Criteria

**Given** 历史记录已包含规划预测和实际结果
**When** 系统计算准确度
**Then** 计算规划命中率（成功次数/总次数）
**And** 计算平均概率偏差（预测概率vs实际成功率）
**And** 按游戏分类统计
**And** 统计结果实时更新
**And** 准确度 ≥ 95%为优秀

## Tasks / Subtasks

- [ ] **Task 1: 创建准确度计算模块** (AC: 1, 2)
  - [ ] 1.1 创建core/analytics/accuracy-calculator.js
  - [ ] 1.2 实现calculateHitRate()方法
  - [ ] 1.3 实现calculateDeviation()方法
  - [ ] 1.4 实现calculateOverallAccuracy()方法
  - [ ] 1.5 导出计算模块

- [ ] **Task 2: 实现命中率计算** (AC: 1)
  - [ ] 2.1 统计成功记录数
  - [ ] 2.2 统计总记录数
  - [ ] 2.3 计算命中率百分比
  - [ ] 2.4 处理零记录情况
  - [ ] 2.5 返回命中率结果

- [ ] **Task 3: 实现概率偏差计算** (AC: 2)
  - [ ] 3.1 获取预测概率和实际结果
  - [ ] 3.2 计算每条记录的偏差
  - [ ] 3.3 计算平均偏差
  - [ ] 3.4 计算标准差
  - [ ] 3.5 返回偏差统计

- [ ] **Task 4: 实现按游戏分类统计** (AC: 3)
  - [ ] 4.1 按游戏ID分组记录
  - [ ] 4.2 计算每个游戏的命中率
  - [ ] 4.3 计算每个游戏的偏差
  - [ ] 4.4 返回分组统计数据
  - [ ] 4.5 支持游戏排序

- [ ] **Task 5: 实现准确度评级** (AC: 5)
  - [ ] 5.1 定义评级标准（优秀/良好/一般/较差）
  - [ ] 5.2 ≥95%为优秀
  - [ ] 5.3 80-95%为良好
  - [ ] 5.4 60-80%为一般
  - [ ] 5.5 <60%为较差

- [ ] **Task 6: 实现实时更新** (AC: 4)
  - [ ] 6.1 监听历史记录变化
  - [ ] 6.2 记录变化时重新计算
  - [ ] 6.3 缓存计算结果
  - [ ] 6.4 提供刷新接口
  - [ ] 6.5 触发更新事件

- [ ] **Task 7: 集成到history-service** (AC: 1-5)
  - [ ] 7.1 在history-service添加getAccuracy()方法
  - [ ] 7.2 调用accuracy-calculator计算
  - [ ] 7.3 返回完整统计数据
  - [ ] 7.4 添加单元测试
  - [ ] 7.5 性能优化

- [ ] **Task 8: 集成测试** (AC: 1-5)
  - [ ] 8.1 测试命中率计算
  - [ ] 8.2 测试偏差计算
  - [ ] 8.3 测试游戏分类
  - [ ] 8.4 测试评级逻辑
  - [ ] 8.5 测试实时更新

## Dev Notes

规划准确度计算模块，用于统计和评估规划预测的准确性。

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- core/analytics/accuracy-calculator.js (新建) - 准确度计算模块
- services/history-service.js (更新) - 添加getAccuracy方法