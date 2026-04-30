# Story 5.4: 游戏配置数据更新机制

Status: ready-for-dev

## Story

As a 开发者,
I want 更新游戏配置数据,
So that 保持数据与游戏版本同步.

## Acceptance Criteria

**Given** 游戏配置JSON已创建
**When** 开发者修改配置文件
**Then** 可修改概率参数（如基础概率调整）
**And** 可修改保底参数（如保底阈值调整）
**And** 可新增游戏配置（添加新JSON文件）
**And** 配置更新后版本号递增
**And** 配置更新后更新日期刷新
**And** 配置加载器重新加载生效

## Tasks / Subtasks

- [ ] **Task 1: 创建配置管理页面** (AC: 1-3)
  - [ ] 1.1 创建pages/config-manager/目录
  - [ ] 1.2 显示现有游戏配置列表
  - [ ] 1.3 显示每个配置的版本信息
  - [ ] 1.4 支持点击进入编辑模式
  - [ ] 1.5 支持添加新游戏配置

- [ ] **Task 2: 实现配置编辑功能** (AC: 1, 2)
  - [ ] 2.1 创建配置编辑表单
  - [ ] 2.2 支持修改概率参数
  - [ ] 2.3 支持修改保底参数
  - [ ] 2.4 实时验证修改内容
  - [ ] 2.5 显示修改前后对比

- [ ] **Task 3: 实现版本管理** (AC: 4, 5)
  - [ ] 3.1 自动递增版本号
  - [ ] 3.2 自动刷新更新日期
  - [ ] 3.3 记录版本历史（可选）
  - [ ] 3.4 显示版本变更日志
  - [ ] 3.5 支持版本回退（可选）

- [ ] **Task 4: 实现配置热加载** (AC: 6)
  - [ ] 4.1 配置修改后自动重新加载
  - [ ] 4.2 清除配置缓存
  - [ ] 4.3 重新验证配置
  - [ ] 4.4 通知相关服务更新
  - [ ] 4.5 确保加载生效

- [ ] **Task 5: 实现新游戏添加** (AC: 3)
  - [ ] 5.1 创建新游戏配置模板
  - [ ] 5.2 支持填写配置参数
  - [ ] 5.3 验证新配置完整性
  - [ ] 5.4 保存新配置文件
  - [ ] 5.5 加载新配置到系统

- [ ] **Task 6: 集成测试** (AC: 1-6)
  - [ ] 6.1 测试配置修改
  - [ ] 6.2 测试版本更新
  - [ ] 6.3 测试热加载
  - [ ] 6.4 测试新游戏添加
  - [ ] 6.5 测试配置验证

## Dev Notes

游戏配置数据更新机制，支持开发者修改和新增游戏配置。

### 配置更新流程

1. 开发者修改配置文件
2. 配置验证器验证修改内容
3. 版本号自动递增
4. 更新日期自动刷新
5. 配置加载器重新加载
6. 清除相关缓存
7. 通知计算器工厂更新

### 版本管理规则

```javascript
// 版本号格式：major.minor.patch
// - major: 重大变更（如新增保底类型）
// - minor: 参数调整（如概率参数修改）
// - patch: 小修正（如文字修正）

function incrementVersion(oldVersion, changeType) {
  const [major, minor, patch] = oldVersion.split('.').map(Number);
  
  switch (changeType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List