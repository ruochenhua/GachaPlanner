# 幸运值计算器 - 任务分解

## 任务列表

### Phase 1: 核心计算引擎

#### Task 1.1: 创建 LuckValueCalculator 类
- **文件**: `core/calculator/luck-value-calculator.js`
- **描述**: 实现幸运值计算器核心逻辑
- **验收标准**:
  - [ ] 继承 BaseCalculator
  - [ ] 实现 calculateSingleProbability 方法
  - [ ] 实现 calculateProbabilityDistribution 方法
  - [ ] 实现 calculateExpectedValue 方法
  - [ ] 实现 calculateStatistics 方法
- **预估时间**: 2 小时

#### Task 1.2: 注册到 CalculatorFactory
- **文件**: `core/calculator/calculator-factory.js`
- **描述**: 将幸运值计算器注册到工厂
- **验收标准**:
  - [ ] 在 calculators 映射中添加 'luck': LuckValueCalculator
  - [ ] 导入 LuckValueCalculator
- **预估时间**: 30 分钟

#### Task 1.3: 创建王者荣耀配置
- **文件**: `config/games/hok-luck.js`
- **描述**: 创建王者荣耀幸运值配置
- **验收标准**:
  - [ ] 配置包含 gameId, name, pityType
  - [ ] 配置包含 baseRate, luckValueMax
  - [ ] 配置包含 resources 和 conversionRate
- **预估时间**: 30 分钟

---

### Phase 2: UI 实现

#### Task 2.1: 规划页添加幸运值输入组件
- **文件**: `pages/planning/planning.wxml`
- **描述**: 添加幸运值输入 UI
- **验收标准**:
  - [ ] 添加滑块输入组件 (0-360)
  - [ ] 显示当前幸运值数值
  - [ ] 显示距离保底次数
- **预估时间**: 1.5 小时

#### Task 2.2: 幸运值输入样式
- **文件**: `pages/planning/planning.wxss`
- **描述**: 添加幸运值输入组件样式
- **验收标准**:
  - [ ] 滑块样式美观
  - [ ] 响应式布局
- **预估时间**: 1 小时

#### Task 2.3: 幸运值处理逻辑
- **文件**: `pages/planning/planning.js`
- **描述**: 实现幸运值输入处理和数据保存
- **验收标准**:
  - [ ] onLuckValueChange 方法处理输入
  - [ ] 调用 PlanningStorage.savePlanningData 自动保存
  - [ ] 触发概率计算更新
- **预估时间**: 1.5 小时

#### Task 2.4: 概率分布图表展示
- **文件**: `pages/planning/planning.wxml` + `.js`
- **描述**: 添加概率分布图表展示
- **验收标准**:
  - [ ] 显示累积概率曲线
  - [ ] 显示期望值、P50、P90 统计
- **预估时间**: 2 小时

---

### Phase 3: 数据持久化

#### Task 3.1: 扩展 PlanningStorage
- **文件**: `services/planning-storage.js`
- **描述**: 添加幸运值数据字段支持
- **验收标准**:
  - [ ] schema 中添加 luckValue 字段
  - [ ] 保存/加载时正确处理 luckValue
- **预估时间**: 1 小时

---

### Phase 4: 测试

#### Task 4.1: 单元测试
- **文件**: `tests/core/calculator/luck-value-calculator.test.js`
- **描述**: 编写幸运值计算器单元测试
- **验收标准**:
  - [ ] 测试 360 幸运值必中
  - [ ] 测试基础概率计算
  - [ ] 测试期望抽数计算
  - [ ] 测试统计指标计算
  - [ ] 覆盖率 > 90%
- **预估时间**: 2 小时

#### Task 4.2: 集成测试
- **文件**: `tests/integration/luck-value-integration.test.js`
- **描述**: 编写端到端集成测试
- **验收标准**:
  - [ ] 测试完整用户流程
  - [ ] 测试数据持久化
- **预估时间**: 1.5 小时

#### Task 4.3: 手动测试
- **描述**: 在小程序开发者工具中手动测试
- **验收标准**:
  - [ ] 输入幸运值后正确显示
  - [ ] 数据保存后重新加载正确
  - [ ] 概率图表显示正确
- **预估时间**: 1 小时

---

### Phase 5: 文档

#### Task 5.1: 更新用户文档
- **文件**: `docs/` 下新增或更新文档
- **描述**: 编写幸运值计算器使用说明
- **验收标准**:
  - [ ] 说明幸运值机制
  - [ ] 说明如何使用
  - [ ] 提供示例
- **预估时间**: 1 小时

---

## 任务依赖关系

```
Task 1.1 ─┬─> Task 1.2 ─> Task 2.1 ─> Task 2.2
          │                           │
          │                           v
          │                     Task 2.3 ─> Task 2.4
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
| Phase 1: 核心计算引擎 | 3 小时 |
| Phase 2: UI 实现 | 6 小时 |
| Phase 3: 数据持久化 | 1 小时 |
| Phase 4: 测试 | 4.5 小时 |
| Phase 5: 文档 | 1 小时 |
| **总计** | **15.5 小时** |

## 里程碑

| 里程碑 | 完成标志 |
|--------|----------|
| M1: 核心完成 | Task 1.1, 1.2, 1.3 完成 |
| M2: UI 完成 | Task 2.1-2.4 完成 |
| M3: 测试完成 | Task 4.1-4.3 完成 |
| M4: 发布 | 所有任务完成，文档更新 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22
