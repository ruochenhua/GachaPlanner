# 多池联动计算器 - 任务分解

## 任务列表

### Phase 1: 核心计算引擎

#### Task 1.1: 创建 MultiPoolCalculator 类
- **文件**: `core/calculator/multi-pool-calculator.js`
- **描述**: 实现多池联动计算器核心逻辑
- **验收标准**:
  - [ ] 继承 BaseCalculator
  - [ ] 实现构造函数 (pools, sharedPityCount, config)
  - [ ] 实现 calculateSinglePoolProbability 方法
  - [ ] 实现 calculateDistributionForPool 方法
  - [ ] 实现 calculateCombinedProbability 方法
  - [ ] 实现 calculateExpectedValue 方法
  - [ ] 实现 calculateStatistics 方法
  - [ ] 实现 findOptimalStrategy 方法
  - [ ] 实现 addPool/removePool 方法
- **预估时间**: 3 小时

#### Task 1.2: 注册到 CalculatorFactory
- **文件**: `core/calculator/calculator-factory.js`
- **描述**: 将多池计算器注册到工厂
- **验收标准**:
  - [ ] 在 calculators 映射中添加 'multi-pool': MultiPoolCalculator
  - [ ] 导入 MultiPoolCalculator
- **预估时间**: 30 分钟

#### Task 1.3: 创建阴阳师配置
- **文件**: `config/games/onmyoji-multi-pool.js`
- **描述**: 创建阴阳师多池配置
- **验收标准**:
  - [ ] 配置包含 gameId, name, pityType
  - [ ] 配置包含 pools 数组
  - [ ] 配置包含 sharedPityCount
  - [ ] 配置包含 pityInheritance
- **预估时间**: 30 分钟

---

### Phase 2: UI 实现

#### Task 2.1: 多池管理界面
- **文件**: `pages/planning/planning.wxml`
- **描述**: 添加多池管理 UI
- **验收标准**:
  - [ ] 卡池列表展示
  - [ ] 添加卡池按钮
  - [ ] 编辑/删除卡池操作
  - [ ] 共享保底计数显示
- **预估时间**: 2 小时

#### Task 2.2: 多池管理样式
- **文件**: `pages/planning/planning.wxss`
- **描述**: 添加多池管理组件样式
- **验收标准**:
  - [ ] 卡池卡片样式
  - [ ] 进度条样式
  - [ ] 响应式布局
- **预估时间**: 1.5 小时

#### Task 2.3: 多池处理逻辑
- **文件**: `pages/planning/planning.js`
- **描述**: 实现多池管理处理逻辑
- **验收标准**:
  - [ ] onPoolAdd 方法
  - [ ] onPoolRemove 方法
  - [ ] onPoolEdit 方法
  - [ ] onPityCountChange 方法
  - [ ] 自动保存调用
- **预估时间**: 2 小时

#### Task 2.4: 最优策略展示
- **文件**: `pages/planning/planning.wxml` + `.js`
- **描述**: 添加最优策略建议展示
- **验收标准**:
  - [ ] 显示推荐池
  - [ ] 显示理由
  - [ ] 显示各池排名
- **预估时间**: 1.5 小时

#### Task 2.5: 概率对比图表
- **文件**: `pages/planning/planning.wxml` + `.js`
- **描述**: 添加概率对比图表
- **验收标准**:
  - [ ] 各池期望值对比
  - [ ] P50/P90 对比
- **预估时间**: 2 小时

---

### Phase 3: 数据持久化

#### Task 3.1: 扩展 PlanningStorage
- **文件**: `services/planning-storage.js`
- **描述**: 添加多池数据字段支持
- **验收标准**:
  - [ ] schema 中添加 pools 字段
  - [ ] schema 中添加 sharedPityCount 字段
  - [ ] 保存/加载时正确处理多池数据
- **预估时间**: 1.5 小时

---

### Phase 4: 测试

#### Task 4.1: 单元测试
- **文件**: `tests/core/calculator/multi-pool-calculator.test.js`
- **描述**: 编写多池计算器单元测试
- **验收标准**:
  - [ ] 测试单池概率计算
  - [ ] 测试 400 抽必中
  - [ ] 测试最优策略选择
  - [ ] 测试期望值计算
  - [ ] 测试统计指标
  - [ ] 覆盖率 > 90%
- **预估时间**: 2.5 小时

#### Task 4.2: 集成测试
- **文件**: `tests/integration/multi-pool-integration.test.js`
- **描述**: 编写端到端集成测试
- **验收标准**:
  - [ ] 测试完整用户流程
  - [ ] 测试多池管理
  - [ ] 测试数据持久化
- **预估时间**: 2 小时

#### Task 4.3: 手动测试
- **描述**: 在小程序开发者工具中手动测试
- **验收标准**:
  - [ ] 多池管理功能正常
  - [ ] 最优策略显示正确
  - [ ] 数据保存后重新加载正确
- **预估时间**: 1.5 小时

---

### Phase 5: 文档

#### Task 5.1: 更新用户文档
- **文件**: `docs/` 下新增或更新文档
- **描述**: 编写多池计算器使用说明
- **验收标准**:
  - [ ] 说明多池联动机制
  - [ ] 说明如何管理卡池
  - [ ] 说明最优策略含义
  - [ ] 提供示例
- **预估时间**: 1.5 小时

---

## 任务依赖关系

```
Task 1.1 ─┬─> Task 1.2 ─> Task 2.1 ─> Task 2.2
          │                           │
          │                           v
          │                     Task 2.3 ─> Task 2.4 ─> Task 2.5
          │                             │
          v                             v
Task 1.3 ─────────────────────────> Task 3.1 ─> Task 4.1 ─> Task 4.2 ─> Task 4.3
                                                               │
                                                               v
                                                         Task 5.1
```

## 总预估时间

| Phase | 时间 |
|-------|------|
| Phase 1: 核心计算引擎 | 4 小时 |
| Phase 2: UI 实现 | 9 小时 |
| Phase 3: 数据持久化 | 1.5 小时 |
| Phase 4: 测试 | 6 小时 |
| Phase 5: 文档 | 1.5 小时 |
| **总计** | **22 小时** |

## 里程碑

| 里程碑 | 完成标志 |
|--------|----------|
| M1: 核心完成 | Task 1.1, 1.2, 1.3 完成 |
| M2: UI 完成 | Task 2.1-2.5 完成 |
| M3: 测试完成 | Task 4.1-4.3 完成 |
| M4: 发布 | 所有任务完成，文档更新 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22
