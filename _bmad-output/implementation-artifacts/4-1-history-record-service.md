# Story 4.1: 历史记录服务实现

Status: ready-for-dev

## Story

As a 系统,
I want 实现历史记录服务,
So that 可靠地存储和查询抽卡历史.

## Acceptance Criteria

**Given** 本地存储服务已实现
**When** 实现history-service.js
**Then** 服务提供saveRecord()保存抽卡记录
**And** 提供loadHistory()查询历史列表
**And** 提供updateRecord()编辑历史记录
**And** 提供deleteRecord()删除历史记录
**And** 记录包含：游戏、卡池、目标、预测概率、实际结果、时间戳
**And** 查询响应时间 < 100ms

## Tasks / Subtasks

- [ ] **Task 1: 创建历史记录服务文件** (AC: 1)
  - [ ] 1.1 创建services/history-service.js
  - [ ] 1.2 定义HISTORY_STORAGE_KEY常量
  - [ ] 1.3 定义记录数据结构
  - [ ] 1.4 导出服务模块

- [ ] **Task 2: 实现保存记录功能** (AC: 1, 5)
  - [ ] 2.1 实现saveRecord()方法
  - [ ] 2.2 生成唯一记录ID
  - [ ] 2.3 添加创建时间戳
  - [ ] 2.4 验证记录数据完整性
  - [ ] 2.5 保存到本地存储

- [ ] **Task 3: 实现查询历史功能** (AC: 2, 6)
  - [ ] 3.1 实现loadHistory()方法
  - [ ] 3.2 支持按游戏筛选
  - [ ] 3.3 支持分页查询
  - [ ] 3.4 按时间倒序排列
  - [ ] 3.5 确保查询响应 < 100ms

- [ ] **Task 4: 实现更新记录功能** (AC: 3)
  - [ ] 4.1 实现updateRecord()方法
  - [ ] 4.2 根据ID查找记录
  - [ ] 4.3 更新记录内容
  - [ ] 4.4 更新修改时间戳
  - [ ] 4.5 保存更新后的数据

- [ ] **Task 5: 实现删除记录功能** (AC: 4)
  - [ ] 5.1 实现deleteRecord()方法
  - [ ] 5.2 根据ID删除记录
  - [ ] 5.3 支持软删除（可选恢复）
  - [ ] 5.4 更新存储数据
  - [ ] 5.5 返回删除结果

- [ ] **Task 6: 实现记录数据验证** (AC: 5)
  - [ ] 6.1 定义必填字段验证
  - [ ] 6.2 验证游戏ID有效性
  - [ ] 6.3 验证概率值范围（0-100）
  - [ ] 6.4 验证时间戳格式
  - [ ] 6.5 返回验证结果

- [ ] **Task 7: 实现统计查询功能** (AC: 2)
  - [ ] 7.1 实现getStats()方法
  - [ ] 7.2 计算总记录数
  - [ ] 7.3 计算成功率
  - [ ] 7.4 按游戏分组统计
  - [ ] 7.5 返回统计数据

- [ ] **Task 8: 集成测试** (AC: 1-6)
  - [ ] 8.1 测试保存记录
  - [ ] 8.2 测试查询历史
  - [ ] 8.3 测试更新记录
  - [ ] 8.4 测试删除记录
  - [ ] 8.5 测试查询性能 < 100ms

## Dev Notes

### 关键技术决策

**服务定位：**
历史记录服务是Epic 4的核心服务，负责管理用户的抽卡历史记录。与storage-service协作，提供统一的历史记录管理接口。

**技术方案选择：**
- 使用本地存储保存历史记录
- 记录ID使用时间戳+随机数生成
- 支持软删除，便于恢复

**数据结构设计：**
```javascript
{
  id: 'record_xxx',           // 唯一ID
  gameId: 'genshin',          // 游戏ID
  gameName: '原神',           // 游戏名称
  poolName: '雷电将军复刻',   // 卡池名称
  target: 'c6',               // 目标（如满命）
  predictedProbability: 65,   // 预测概率（%）
  actualResult: 'success',    // 实际结果：success/failure
  pullsUsed: 80,              // 实际抽数
  resourcesUsed: 12800,       // 消耗资源
  createdAt: 1712345678901,   // 创建时间戳
  updatedAt: 1712345678901,   // 更新时间戳
  isDeleted: false            // 软删除标记
}
```

### 服务接口设计

```javascript
// services/history-service.js

const HISTORY_STORAGE_KEY = 'gacha_history';

/**
 * 保存历史记录
 * @param {Object} record 记录数据
 * @returns {Object} 保存的记录（含ID）
 */
function saveRecord(record) { ... }

/**
 * 加载历史记录列表
 * @param {Object} options 查询选项
 * @returns {Array} 历史记录列表
 */
function loadHistory(options = {}) { ... }

/**
 * 更新历史记录
 * @param {String} id 记录ID
 * @param {Object} updates 更新内容
 * @returns {Boolean} 更新是否成功
 */
function updateRecord(id, updates) { ... }

/**
 * 删除历史记录
 * @param {String} id 记录ID
 * @param {Boolean} soft 是否软删除
 * @returns {Boolean} 删除是否成功
 */
function deleteRecord(id, soft = true) { ... }

/**
 * 获取统计数据
 * @param {String} gameId 游戏ID（可选）
 * @returns {Object} 统计数据
 */
function getStats(gameId) { ... }
```

### References

- [Source: architecture.md#数据持久化]
- [Source: architecture.md#服务层]
- [Source: epics.md#Story 4.1]

## Dev Agent Record

### Agent Model Used

glm-5

### Completion Notes List

### File List

- services/history-service.js (新建) - 历史记录服务实现