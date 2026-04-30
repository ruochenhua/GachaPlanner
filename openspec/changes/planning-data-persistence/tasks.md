# 规划数据持久化 - 任务分解

## 任务列表

### Phase 1: 核心存储服务

#### Task 1.1: 创建 PlanningStorage 服务类
- **文件**: `services/planning-storage.js`
- **描述**: 实现规划数据持久化服务
- **验收标准**:
  - [ ] 实现 savePlanningData 方法
  - [ ] 实现 loadPlanningData 方法
  - [ ] 实现 deletePlanningData 方法
  - [ ] 实现 getAllPlanningData 方法
  - [ ] 实现 _getDefaultData 方法
  - [ ] 实现 _migrateData 方法（版本迁移）
  - [ ] 错误处理完善
- **预估时间**: 3 小时

#### Task 1.2: 定义数据 Schema
- **文件**: `services/planning-storage.js` (内联)
- **描述**: 定义规划数据结构
- **验收标准**:
  - [ ] 定义 resources 字段
  - [ ] 定义 poolTimeRange 字段
  - [ ] 定义 dailyIncome 字段
  - [ ] 定义 targets 字段
  - [ ] 定义 metadata 字段
  - [ ] 定义 version 字段
- **预估时间**: 1 小时

---

### Phase 2: UI 集成

#### Task 2.1: 规划页集成数据加载
- **文件**: `pages/planning/planning.js`
- **描述**: 在规划页 onLoad 时加载数据
- **验收标准**:
  - [ ] onLoad 时调用 PlanningStorage.loadPlanningData
  - [ ] 加载成功显示数据
  - [ ] 加载失败显示默认值
  - [ ] 添加加载状态提示
- **预估时间**: 1.5 小时

#### Task 2.2: 规划页集成自动保存
- **文件**: `pages/planning/planning.js`
- **描述**: 在数据变化时自动保存
- **验收标准**:
  - [ ] onResourceChange 调用 savePlanningData
  - [ ] onPoolTimeChange 调用 savePlanningData
  - [ ] onDailyIncomeChange 调用 savePlanningData
  - [ ] onTargetChange 调用 savePlanningData
- **预估时间**: 1.5 小时

#### Task 2.3: 目标管理 UI
- **文件**: `pages/planning/planning.wxml`
- **描述**: 添加目标管理界面
- **验收标准**:
  - [ ] 目标列表展示
  - [ ] 添加目标按钮
  - [ ] 编辑/删除目标操作
  - [ ] 目标优先级显示
- **预估时间**: 2 小时

#### Task 2.4: 目标管理样式
- **文件**: `pages/planning/planning.wxss`
- **描述**: 目标管理样式
- **验收标准**:
  - [ ] 目标卡片样式
  - [ ] 优先级标签样式
  - [ ] 操作按钮样式
- **预估时间**: 1 小时

#### Task 2.5: 目标管理逻辑
- **文件**: `pages/planning/planning.js`
- **描述**: 目标管理处理逻辑
- **验收标准**:
  - [ ] onTargetAdd 方法
  - [ ] onTargetUpdate 方法
  - [ ] onTargetDelete 方法
  - [ ] 自动保存调用
- **预估时间**: 1.5 小时

---

### Phase 3: 数据管理功能

#### Task 3.1: 数据管理入口
- **文件**: `pages/config-manager/config-manager.wxml` + `.js`
- **描述**: 在配置管理页添加数据管理入口
- **验收标准**:
  - [ ] 添加「规划数据管理」入口
  - [ ] 点击跳转到数据管理页
- **预估时间**: 1 小时

#### Task 3.2: 数据管理页面
- **文件**: `pages/planning-data-manager/planning-data-manager.wxml`
- **描述**: 创建数据管理页面
- **验收标准**:
  - [ ] 显示所有游戏的规划数据列表
  - [ ] 显示元数据（最后保存时间、保存次数）
  - [ ] 删除单个游戏数据按钮
  - [ ] 重置所有数据按钮
- **预估时间**: 2 小时

#### Task 3.3: 数据管理样式
- **文件**: `pages/planning-data-manager/planning-data-manager.wxss`
- **描述**: 数据管理页面样式
- **验收标准**:
  - [ ] 数据列表样式
  - [ ] 操作按钮样式
  - [ ] 确认对话框样式
- **预估时间**: 1 小时

#### Task 3.4: 数据管理逻辑
- **文件**: `pages/planning-data-manager/planning-data-manager.js`
- **描述**: 数据管理页面逻辑
- **验收标准**:
  - [ ] 加载所有游戏数据列表
  - [ ] 删除单个游戏数据
  - [ ] 重置所有数据（带确认）
- **预估时间**: 1.5 小时

---

### Phase 4: 测试

#### Task 4.1: 单元测试
- **文件**: `tests/services/planning-storage.test.js`
- **描述**: 编写 PlanningStorage 单元测试
- **验收标准**:
  - [ ] 测试保存功能
  - [ ] 测试加载功能
  - [ ] 测试删除功能
  - [ ] 测试获取所有数据
  - [ ] 测试默认数据
  - [ ] 测试数据迁移
  - [ ] 覆盖率 > 90%
- **预估时间**: 2.5 小时

#### Task 4.2: 集成测试
- **文件**: `tests/integration/planning-storage-integration.test.js`
- **描述**: 编写端到端集成测试
- **验收标准**:
  - [ ] 测试完整保存流程
  - [ ] 测试完整加载流程
  - [ ] 测试自动保存
- **预估时间**: 2 小时

#### Task 4.3: 手动测试
- **描述**: 在小程序开发者工具中手动测试
- **验收标准**:
  - [ ] 数据保存后重新加载正确
  - [ ] 自动保存功能正常
  - [ ] 数据管理功能正常
- **预估时间**: 1.5 小时

---

### Phase 5: 文档

#### Task 5.1: 更新用户文档
- **文件**: `docs/planning-data-guide.md`
- **描述**: 编写规划数据持久化使用说明
- **验收标准**:
  - [ ] 说明数据自动保存机制
  - [ ] 说明如何管理规划数据
  - [ ] 说明数据格式
- **预估时间**: 1 小时

---

## 任务依赖关系

```
Task 1.1 ─> Task 1.2 ─┬─> Task 2.1 ─> Task 2.2 ─┬─> Task 2.3 ─> Task 2.4 ─> Task 2.5
                      │                         │
                      │                         v
                      │                   Task 3.1 ─> Task 3.2 ─> Task 3.3 ─> Task 3.4
                      │                         │
                      v                         v
                    并行开发 ──────────────> Task 4.1 ─> Task 4.2 ─> Task 4.3
                                              │
                                              v
                                        Task 5.1
```

## 总预估时间

| Phase | 时间 |
|-------|------|
| Phase 1: 核心存储服务 | 4 小时 |
| Phase 2: UI 集成 | 7.5 小时 |
| Phase 3: 数据管理功能 | 5.5 小时 |
| Phase 4: 测试 | 6 小时 |
| Phase 5: 文档 | 1 小时 |
| **总计** | **24 小时** |

## 里程碑

| 里程碑 | 完成标志 |
|--------|----------|
| M1: 核心完成 | Task 1.1, 1.2 完成 |
| M2: UI 集成完成 | Task 2.1-2.5 完成 |
| M3: 数据管理完成 | Task 3.1-3.4 完成 |
| M4: 测试完成 | Task 4.1-4.3 完成 |
| M5: 发布 | 所有任务完成，文档更新 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22
