# Story 5.1: 配置驱动架构完善

Status: ready-for-dev

## Story

As a 开发者,
I want 完善配置驱动架构,
So that 游戏数据与计算逻辑完全分离.

## Acceptance Criteria

**Given** 游戏配置JSON已创建
**When** 完善配置驱动架构
**Then** 所有游戏参数从配置读取（无硬编码）
**And** 配置包含：游戏名称、保底类型、保底阈值、基础概率、资源类型、资源转换率
**And** 配置验证器检查必填字段
**And** 配置加载器支持动态加载新游戏
**And** 配置格式文档化

## Tasks / Subtasks

- [ ] **Task 1: 完善游戏配置格式** (AC: 2)
  - [ ] 1.1 定义完整的配置字段规范
  - [ ] 1.2 添加资源转换率配置
  - [ ] 1.3 添加UP机制配置
  - [ ] 1.4 添加继承规则配置
  - [ ] 1.5 更新现有游戏配置文件

- [ ] **Task 2: 实现配置验证器** (AC: 3)
  - [ ] 2.1 创建core/config/config-validator.js
  - [ ] 2.2 验证必填字段
  - [ ] 2.3 验证字段类型
  - [ ] 2.4 验证数值范围
  - [ ] 2.5 返回验证结果

- [ ] **Task 3: 实现配置加载器增强** (AC: 4)
  - [ ] 3.1 支持动态加载新游戏配置
  - [ ] 3.2 支持配置热加载（无需重启）
  - [ ] 3.3 配置加载失败处理
  - [ ] 3.4 配置缓存机制
  - [ ] 3.5 配置加载性能优化

- [ ] **Task 4: 消除硬编码参数** (AC: 1)
  - [ ] 4.1 检查并移除计算器中的硬编码
  - [ ] 4.2 检查并移除服务中的硬编码
  - [ ] 4.3 检查并移除组件中的硬编码
  - [ ] 4.4 所有参数改为从配置读取
  - [ ] 4.5 确保配置缺失时有默认值

- [ ] **Task 5: 配置格式文档化** (AC: 5)
  - [ ] 5.1 创建docs/config-format.md
  - [ ] 5.2 文档说明每个字段含义
  - [ ] 5.3 文档说明字段格式要求
  - [ ] 5.4 文档包含配置示例
  - [ ] 5.5 文档说明添加新游戏的步骤

- [ ] **Task 6: 集成测试** (AC: 1-5)
  - [ ] 6.1 测试配置验证
  - [ ] 6.2 测试配置加载
  - [ ] 6.3 测试动态加载新配置
  - [ ] 6.4 测试参数读取正确性
  - [ ] 6.5 测试错误配置处理

## Dev Notes

配置驱动架构完善，确保所有游戏参数从配置读取，无硬编码。

### 配置字段规范

```javascript
{
  "gameId": "genshin",           // 游戏ID（必填）
  "name": "原神",                 // 游戏名称（必填）
  "version": "1.0.0",            // 配置版本号（必填）
  "updatedAt": "2026-04-01",     // 更新日期（必填）
  
  "pityType": "hard",            // 保底类型：hard/soft/none（必填）
  "baseRate": 0.006,             // 基础概率（必填，0-1之间）
  "hardPity": 90,                // 硬保底阈值（hard类型必填）
  "softPityStart": 74,           // 软保底起始抽数（soft类型必填）
  "softPityRate": 0.02,          // 软保底概率提升率（soft类型必填）
  
  "inheritance": true,           // 保底是否继承（可选，默认true）
  "upMechanism": true,           // 是否有UP机制（可选）
  
  "resources": {                 // 资源类型（必填）
    "primary": {                 // 主要资源
      "id": "primogems",
      "name": "原石",
      "convertRate": 160         // 资源转换率（160原石=1抽）
    },
    "secondary": {               // 次要资源
      "id": "intertwinedFates",
      "name": "纠缠之缘",
      "convertRate": 1           // 1缘=1抽
    }
  },
  
  "icon": "/assets/games/genshin.png",  // 游戏图标路径（可选）
  "color": "#D4AF37"              // 游戏主题色（可选）
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- core/config/config-validator.js (新建) - 配置验证器