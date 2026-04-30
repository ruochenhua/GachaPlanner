---
name: enhanced-config-template
description: 增强版通用配置模板已完成，支持所有主流抽卡机制，包含导出导入功能
type: project
---

# 增强版配置模板

**完成时间**：2026-04-19

## 核心成果

### 1. 通用配置模板

`config/config-template-enhanced.js` 包含：

- **完整字段定义** - 涵盖所有保底机制参数
- **预设游戏模板** - mihoyo, arknights, fgo, hok, onmyoji
- **配置验证** - 参数范围、逻辑规则验证
- **导出导入** - checksum验证，JSON格式化

### 2. 保底机制覆盖

| 机制 | 模板 | 状态 |
|------|------|------|
| 硬保底+软保底+大小保底 | mihoyo | ✅ 已实现 |
| 软保底+无大小保底 | arknights | ✅ 已实现 |
| 纯概率无保底 | fgo | ✅ 已实现 |
| 幸运值机制 | hok | ✅ 配置模板（计算器待实现） |
| 多池联动 | onmyoji | ✅ 配置模板（计算器待实现） |

### 3. 配置管理页面

`pages/config-manager/` 提供：

- 导出到剪贴板（分享给好友）
- 保存为文件（长期备份）
- 从剪贴板导入（接收配置）
- 重置为默认（恢复参数）

### 4. 配置服务

`services/config-export-service.js` 提供：

- `exportGameConfig(gameId)` - 导出配置
- `importGameConfig(jsonStr)` - 导入配置
- `shareConfigToClipboard(gameId)` - 分享到剪贴板
- `checkConfigCompatibility(config)` - 兼容性检查

### 5. 预设游戏配置

```
config/games/
├── genshin-enhanced.js     # 原神（含捕获明光）
├── arknights-enhanced.js   # 明日方舟
├── fgo-enhanced.js         # FGO
└── hok-enhanced.js         # 王者荣耀（幸运值）
```

## Why

基于抽卡游戏概率机制调研结果（见 `docs/gacha-mechanism-research.md`），需要设计一个能够涵盖所有主流游戏机制的通用配置模板，并让玩家可以方便地配置、导出、导入和分享配置。

## How to apply

1. **创建新游戏配置**：使用 `createGameConfig(templateType, customConfig)` 选择预设模板并自定义参数
2. **配置导出**：在配置管理页面导出到剪贴板或文件
3. **配置导入**：从剪贴板导入配置，自动验证 checksum 和参数合法性
4. **参数编辑**：在规则设置页面修改参数，保存后立即生效

## 待完成工作

- 实现 `luck-value-calculator.js`（幸运值计算器）
- 实现 `multi-pool-calculator.js`（多池联动计算器）
- 配置模板库扩展（更多预设游戏）
- 云端配置备份（跨设备同步）

## 相关文档

- 详细使用指南：`docs/enhanced-config-guide.md`
- 调研报告：`docs/gacha-mechanism-research.md`
- 原有架构文档：`docs/architecture/README.md`