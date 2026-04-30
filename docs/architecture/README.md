# GachaPlaner 架构扩展指南

本目录包含 GachaPlaner 项目的架构扩展文档，帮助开发者快速接入新游戏。

## 文档目录

- [配置指南](./config-guide.md) - 游戏配置文件格式和字段说明
- [保底策略指南](./pity-strategy.md) - 如何实现新的保底策略
- [自定义游戏指南](./custom-game.md) - 如何添加自定义游戏模板

## 快速开始

### 添加新游戏的步骤

1. **创建配置文件** - 在 `config/games/` 目录下创建新的 JSON 配置文件
2. **配置参数** - 填写游戏名称、保底类型、概率参数等
3. **验证配置** - 使用配置验证器检查配置正确性
4. **测试计算** - 验证概率计算结果符合预期

### 示例：添加 FGO

```json
{
  "gameId": "fgo",
  "name": "命运-冠位指定",
  "version": "1.0.0",
  "updatedAt": "2026-04-11",
  
  "pityType": "none",
  "baseRate": 0.01,
  
  "resources": {
    "quartz": {
      "name": "圣晶石",
      "icon": "/assets/images/games/quartz.png"
    }
  },
  
  "conversionRate": {
    "quartzToPull": 3
  }
}
```

## 架构概览

```
GachaPlaner/
├── config/              # 游戏配置
│   └── games/           # 游戏配置JSON文件
├── core/                # 核心计算逻辑
│   ├── calculator/      # 概率计算器
│   │   ├── base-calculator.js
│   │   ├── hard-pity.js
│   │   ├── soft-pity.js
│   │   ├── no-pity.js
│   │   └── calculator-factory.js
│   └── config/          # 配置验证器
├── services/            # 服务层
└── components/          # UI组件
```

## 设计原则

1. **配置驱动** - 所有游戏参数从配置读取，无硬编码
2. **策略模式** - 不同保底机制通过策略模式实现
3. **开放封闭** - 对扩展开放，对修改封闭
4. **单一职责** - 每个模块只负责一个功能