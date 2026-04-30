# Story 5.2: 自定义游戏模板接口设计

Status: ready-for-dev

## Story

As a 系统架构师,
I want 设计自定义游戏模板接口,
So that 用户可自定义未收录游戏.

## Acceptance Criteria

**Given** 配置驱动架构已完善
**When** 设计自定义模板接口
**Then** 接口支持配置保底类型（硬/软/无）
**And** 接口支持配置基础概率参数
**And** 接口支持配置保底阈值参数
**And** 接口支持配置继承规则参数
**And** 接口支持配置概率UP机制参数
**And** 接口文档化供未来实现

## Tasks / Subtasks

- [ ] **Task 1: 设计自定义模板数据结构** (AC: 1-5)
  - [ ] 1.1 定义CustomGameTemplate接口
  - [ ] 1.2 定义保底类型配置接口
  - [ ] 1.3 定义概率参数配置接口
  - [ ] 1.4 定义资源类型配置接口
  - [ ] 1.5 定义验证规则

- [ ] **Task 2: 实现模板创建服务** (AC: 1)
  - [ ] 2.1 创建services/custom-game-service.js
  - [ ] 2.2 实现createTemplate()方法
  - [ ] 2.3 实现validateTemplate()方法
  - [ ] 2.4 实现saveTemplate()方法
  - [ ] 2.5 实现loadTemplate()方法

- [ ] **Task 3: 设计模板编辑界面** (AC: 2-5)
  - [ ] 3.1 创建pages/custom-game/目录
  - [ ] 3.2 实现游戏名称输入
  - [ ] 3.3 实现保底类型选择（下拉框）
  - [ ] 3.4 实现概率参数输入（数字输入框）
  - [ ] 3.5 实现资源类型配置

- [ ] **Task 4: 实现模板预览功能** (AC: 1-5)
  - [ ] 4.1 显示配置摘要预览
  - [ ] 4.2 验证结果实时反馈
  - [ ] 4.3 预览概率计算效果
  - [ ] 4.4 显示配置完整度指示
  - [ ] 4.5 支持保存草稿

- [ ] **Task 5: 接口文档化** (AC: 6)
  - [ ] 5.1 创建docs/custom-game-api.md
  - [ ] 5.2 文档说明接口结构
  - [ ] 5.3 文档说明各字段含义
  - [ ] 5.4 文档包含示例模板
  - [ ] 5.5 文档说明验证规则

- [ ] **Task 6: 集成测试** (AC: 1-5)
  - [ ] 6.1 测试模板创建
  - [ ] 6.2 测试模板验证
  - [ ] 6.3 测试模板保存
  - [ ] 6.4 测试模板加载
  - [ ] 6.5 测试模板使用

## Dev Notes

自定义游戏模板接口设计，为未来支持用户自定义游戏预留架构。

### 接口设计

```javascript
// CustomGameTemplate 接口
interface CustomGameTemplate {
  id: string;                    // 模板ID
  name: string;                  // 游戏名称
  createdAt: number;             // 创建时间
  
  pityConfig: PityConfig;        // 保底配置
  probabilityConfig: ProbabilityConfig; // 概率配置
  resourceConfig: ResourceConfig; // 资源配置
  
  isActive: boolean;             // 是否启用
  isValidated: boolean;          // 是否已验证
}

// PityConfig 保底配置接口
interface PityConfig {
  type: 'hard' | 'soft' | 'none'; // 保底类型
  
  // 硬保底参数
  hardPity?: number;             // 硬保底阈值
  
  // 软保底参数
  softPityStart?: number;        // 软保底起始抽数
  softPityRate?: number;         // 每抽概率提升
  
  // 继承规则
  inheritance: boolean;          // 保底是否继承
}

// ProbabilityConfig 概率配置接口
interface ProbabilityConfig {
  baseRate: number;              // 基础概率（0-1）
  upMechanism: boolean;          // 是否有UP机制
  upRate?: number;               // UP概率（如有UP）
}

// ResourceConfig 资源配置接口
interface ResourceConfig {
  primaryResource: ResourceDefinition;
  secondaryResource?: ResourceDefinition;
}

interface ResourceDefinition {
  id: string;                    // 资源ID
  name: string;                  // 资源名称
  convertRate: number;           // 资源转换率
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- services/custom-game-service.js (新建) - 自定义游戏服务