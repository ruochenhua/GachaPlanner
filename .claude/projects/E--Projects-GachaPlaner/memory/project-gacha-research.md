---
name: gacha-mechanism-research
description: 主流抽卡游戏概率机制调研结果，包含通用配置模板设计
type: project
---

# 抽卡游戏概率机制调研

**调研时间**：2026-04-19

## 核心发现

### 1. 主流机制分类

| 类型 | 代表游戏 | 特点 |
|------|----------|------|
| 硬保底+软保底+大小保底 | 原神、崩铁、绝区零 | 0.6%基础，90硬保底，74起软保底，50%小保底UP |
| 软保底+无大小保底 | 明日方舟 | 2%基础，50抽起软保底，无硬保底 |
| 纯概率无保底 | FGO、碧蓝航线 | 最"赌狗"，无保护机制 |
| 硬保底+幸运值 | 王者荣耀 | 361次硬保底，失败累积幸运值 |
| 多池联动保底 | 阴阳师 | 跨池保底共享，复杂联动 |

### 2. 通用配置模板

```json
{
  "pityType": "hard|soft|none|guarantee",
  "baseRate": 0.006,

  "hardPity": {
    "enabled": true,
    "count": 90,
    "resetOnSuccess": true
  },

  "softPity": {
    "enabled": true,
    "start": 74,
    "increment": 0.06,
    "maxRate": 1.0
  },

  "guarantee": {
    "enabled": true,
    "rate": 0.5
  },

  "pityInheritance": {
    "enabled": true,
    "crossPool": false
  }
}
```

### 3. 当前项目覆盖情况

| 机制 | 状态 | 计算器 |
|------|------|--------|
| 硬保底 | ✅ 已实现 | hard-pity.js |
| 软保底 | ✅ 已实现 | soft-pity.js |
| 无保底 | ✅ 已实现 | no-pity.js |
| 大小保底 | ✅ 已实现 | guarantee-calculator.js |
| 动态概率 | ⏳ Story 2.10 | dynamic-probability-calculator.js |
| 幸运值机制 | 🔲 未实现 | 需新增 |
| 多池联动 | 🔲 未实现 | 需新增 |

### 4. 玩家可配置功能设计

**配置界面**：
- 基础配置：游戏名称、基础概率、保底类型选择
- 保底配置：硬保底/软保底/大小保底参数（动态显示）
- 高级配置：保底继承、跨池继承、自定义资源
- 导出/导入：JSON配置 + checksum验证

**Why**: 用户需要为不同游戏配置概率参数，当前配置硬编码在游戏配置文件中，玩家无法修改。调研发现主流游戏机制差异大，需要灵活的配置模板支持。

**How to apply**: 在实现 Story 5.9（玩家可配置概率参数）时，参考此调研结果设计配置界面和验证规则。完成后可考虑新增幸运值计算器（王者荣耀）和多池联动计算器（阴阳师）。

## 详细报告

完整调研报告见：`docs/gacha-mechanism-research.md`
