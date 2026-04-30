# Story 5.8: 架构扩展性文档化

Status: ready-for-dev

## Story

As a 开发者,
I want 清晰的架构扩展文档,
So that 未来快速接入新游戏.

## Acceptance Criteria

**Given** 配置驱动架构已完善
**When** 编写架构扩展文档
**Then** 文档说明如何添加新游戏配置
**And** 文档说明配置字段含义和格式
**And** 文档说明如何实现新保底策略
**And** 文档说明如何扩展自定义游戏模板
**And** 文档包含示例配置和代码

## Tasks / Subtasks

- [ ] **Task 1: 创建架构文档目录** (AC: 1-5)
  - [ ] 1.1 创建docs/architecture/目录
  - [ ] 1.2 创建docs/architecture/README.md
  - [ ] 1.3 创建docs/architecture/config-guide.md
  - [ ] 1.4 创建docs/architecture/pity-strategy.md
  - [ ] 1.5 创建docs/architecture/custom-game.md

- [ ] **Task 2: 编写配置指南文档** (AC: 1, 2)
  - [ ] 2.1 说明配置文件结构
  - [ ] 2.2 说明每个字段含义
  - [ ] 2.3 说明字段格式要求
  - [ ] 2.4 说明验证规则
  - [ ] 2.5 提供完整配置示例

- [ ] **Task 3: 编写保底策略文档** (AC: 3)
  - [ ] 3.1 说明现有保底策略
  - [ ] 3.2 说明策略实现步骤
  - [ ] 3.3 说明策略接口规范
  - [ ] 3.4 说明计算器工厂扩展
  - [ ] 3.5 提供新策略示例代码

- [ ] **Task 4: 编写自定义游戏文档** (AC: 4)
  - [ ] 4.1 说明自定义模板接口
  - [ ] 4.2 说明模板创建流程
  - [ ] 4.3 说明模板验证规则
  - [ ] 4.4 说明模板使用方法
  - [ ] 4.5 提供模板创建示例

- [ ] **Task 5: 编写快速接入指南** (AC: 5)
  - [ ] 5.1 新游戏接入流程概述
  - [ ] 5.2 配置文件创建步骤
  - [ ] 5.3 配置验证测试
  - [ ] 5.4 功能集成验证
  - [ ] 5.5 常见问题解答

- [ ] **Task 6: 文档审核与完善** (AC: 1-5)
  - [ ] 6.1 检查文档完整性
  - [ ] 6.2 检查示例可运行
  - [ ] 6.3 检查步骤清晰度
  - [ ] 6.4 补充缺失内容
  - [ ] 6.5 更新文档目录索引

## Dev Notes

架构扩展性文档化，为未来快速接入新游戏提供清晰指南。

### 文档目录结构

```
docs/
├── architecture/
│   ├── README.md           # 架构概述
│   ├── config-guide.md     # 配置指南
│   ├── pity-strategy.md    # 保底策略指南
│   ├── custom-game.md      # 自定义游戏指南
│   └── examples/           # 示例目录
│       ├── genshin-config.json
│       ├── starrail-config.json
│       ├── fgo-config.json
│       └── custom-pity.js
```

### 文档内容大纲

**config-guide.md:**
- 配置文件位置和命名规范
- 必填字段说明
- 可选字段说明
- 字段类型和格式要求
- 验证规则详解
- 完整配置示例

**pity-strategy.md:**
- 现有保底策略介绍
- 保底策略接口规范
- 如何实现新保底策略
- 如何注册到计算器工厂
- 策略测试要求
- 示例代码

**custom-game.md:**
- 自定义游戏模板接口
- 模板创建流程
- 模板验证规则
- 模板保存和加载
- 模板使用注意事项
- 示例模板

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- docs/architecture/README.md (新建) - 架构文档索引
- docs/architecture/config-guide.md (新建) - 配置指南
- docs/architecture/pity-strategy.md (新建) - 保底策略指南
- docs/architecture/custom-game.md (新建) - 自定义游戏指南