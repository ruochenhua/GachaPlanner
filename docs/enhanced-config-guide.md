# 增强版配置模板使用指南

版本: 2.0.0
更新日期: 2026-04-19

---

## 一、概述

基于主流抽卡游戏概率机制调研结果，设计了增强版通用配置模板，支持所有常见抽卡机制。

### 支持的游戏类型

| 类型 | 代表游戏 | 配置模板 |
|------|----------|----------|
| 硬保底+软保底+大小保底 | 原神、崩铁、绝区零 | `mihoyo` |
| 软保底+无大小保底 | 明日方舟 | `arknights` |
| 纯概率无保底 | FGO、碧蓝航线 | `fgo` |
| 幸运值机制 | 王者荣耀 | `hok` |
| 多池联动保底 | 阴阳师 | `onmyoji` |

---

## 二、配置结构

### 2.1 核心字段

```javascript
{
  gameId: '',           // 游戏唯一标识（必填）
  name: '',             // 游戏名称（必填）
  pityType: 'none',     // 保底类型（必填）
  baseRate: 0.01,       // 基础概率（必填，0.001-1.0）
  version: '2.0.0',     // 配置版本
  updatedAt: ''         // 更新日期
}
```

### 2.2 保底机制配置

#### 硬保底 (hardPity)

```javascript
hardPity: {
  enabled: true,        // 是否启用
  count: 90,            // 保底抽数（1-1000）
  resetOnSuccess: true  // 成功后是否重置
}
```

#### 软保底 (softPity)

```javascript
softPity: {
  enabled: true,        // 是否启用
  start: 74,            // 软保底起始抽数
  increment: 0.06,      // 每抽概率增量
  maxRate: 1.0          // 最大概率上限
}
```

#### 大小保底 (guarantee)

```javascript
guarantee: {
  enabled: true,        // 是否启用大小保底
  rate: 0.5,            // 小保底UP概率
  captureLight: false,  // 是否启用捕获明光（原神5.0+）
  captureLightRate: 0.55 // 捕获明光UP概率
}
```

#### 幸运值机制 (luckValue)

```javascript
luckValue: {
  enabled: true,        // 是否启用幸运值
  maxValue: 361,        // 幸运值上限
  incrementPerPull: 1,  // 每次失败增加的幸运值
  ratePerLuck: 0,       // 每点幸运值增加的概率（可选）
  guaranteeAtMax: true  // 达到上限是否必定成功
}
```

#### 多池联动 (multiPool)

```javascript
multiPool: {
  enabled: true,        // 是否启用多池联动
  sharedPity: true,     // 是否共享保底计数
  pools: [
    {
      poolId: 'character',
      name: '角色池',
      items: ['5星角色']
    }
  ]
}
```

### 2.3 资源定义

```javascript
resources: {
  primary: {
    id: 'primogems',
    name: '原石',
    icon: '/assets/primogem.png',
    type: 'primary'
  },
  secondary: {
    id: 'intertwinedFates',
    name: '纠缠之缘',
    icon: '/assets/fate.png',
    type: 'secondary'
  }
},

conversionRate: {
  primaryToPull: 160    // 主要资源转换为抽数的比率
}
```

---

## 三、使用方法

### 3.1 创建配置

使用模板创建新游戏配置：

```javascript
const { createGameConfig } = require('./config/config-template-enhanced');

// 方式1: 使用预设模板
const genshinConfig = createGameConfig('mihoyo', {
  gameId: 'genshin',
  name: '原神',
  resources: {
    primary: { id: 'primogems', name: '原石' },
    secondary: { id: 'intertwinedFates', name: '纠缠之缘' }
  },
  conversionRate: { primaryToPull: 160 }
});

// 方式2: 完全自定义
const customConfig = createGameConfig('fgo', {
  gameId: 'my-game',
  name: '我的游戏',
  baseRate: 0.02,
  hardPity: { enabled: true, count: 50 }
});
```

### 3.2 验证配置

```javascript
const { validateEnhancedConfig } = require('./config/config-template-enhanced');

const validation = validateEnhancedConfig(config);
if (!validation.valid) {
  console.error('配置验证失败:', validation.errors);
}
```

### 3.3 导出/导入配置

```javascript
const { exportConfig, importConfig } = require('./config/config-template-enhanced');

// 导出
const jsonStr = exportConfig(config);

// 导入
const result = importConfig(jsonStr);
if (result.success) {
  const config = result.config;
}
```

---

## 四、配置管理页面

### 4.1 功能入口

在 `profile.wxml` 中添加了两个入口：

1. **规则设置** - 编辑概率参数
2. **配置管理** - 导出/导入/分享配置

### 4.2 配置管理功能

- **导出到剪贴板** - 快速分享给好友
- **保存为文件** - 长期备份
- **从剪贴板导入** - 接收好友配置
- **重置为默认** - 恢复游戏默认参数

### 4.3 配置导出格式

```json
{
  "version": "2.0.0",
  "exportedAt": "2026-04-19T...",
  "config": {
    "gameId": "genshin",
    "name": "原神",
    "baseRate": 0.006,
    ...
  },
  "checksum": "a1b2c3d4"
}
```

---

## 五、预设游戏示例

### 5.1 原神配置

见 `config/games/genshin-enhanced.js`

特点：
- 硬保底 90抽
- 软保底 74抽起，每抽 +6%
- 大小保底机制，小保底UP率 50%
- 捕获明光机制（5.0新增），连续歪后UP概率提升到 55%

### 5.2 明日方舟配置

见 `config/games/arknights-enhanced.js`

特点：
- 软保底 50抽起，每抽 +2%
- 无硬保底，概率递增至 100%
- 无大小保底机制

### 5.3 FGO配置

见 `config/games/fgo-enhanced.js`

特点：
- 纯概率 1%
- 无保底机制
- "赌狗"游戏

### 5.4 王者荣耀配置

见 `config/games/hok-enhanced.js`

特点：
- 幸运值机制，上限 361
- 每次失败 +1 幸运值
- 达到 361 必定成功

---

## 六、扩展计算器

### 6.1 已有计算器

| 计算器 | 文件 | 适用场景 |
|--------|------|----------|
| 硬保底 | `hard-pity.js` | 硬保底机制 |
| 软保底 | `soft-pity.js` | 软保底机制 |
| 无保底 | `no-pity.js` | 纯概率 |
| 大小保底 | `guarantee-calculator.js` | 大小保底 |
| 动态概率 | `dynamic-probability-calculator.js` | 时间维度 |
| 综合概率 | `combined-probability-calculator.js` | 多游戏 |

### 6.2 待实现计算器

- **幸运值计算器** (`luck-value-calculator.js`) - 王者荣耀类
- **多池联动计算器** (`multi-pool-calculator.js`) - 阴阳师类

---

## 七、最佳实践

### 7.1 配置创建流程

1. 选择合适的预设模板
2. 填写基础信息和资源定义
3. 验证配置完整性
4. 测试概率计算结果
5. 导出并分享给用户

### 7.2 配置更新流程

1. 用户在规则设置页修改参数
2. 参数保存到 `storage-service`
3. `config-loader` 优先加载用户自定义参数
4. 首页/规划页概率计算立即更新

### 7.3 配置分享流程

1. 用户在配置管理页导出配置
2. 复制到剪贴板分享给好友
3. 好友导入配置并验证
4. 应用自定义配置

---

## 八、注意事项

### 8.1 参数范围验证

| 参数 | 范围 | 说明 |
|------|------|------|
| baseRate | 0.001 - 1.0 | 基础概率 |
| hardPity.count | 1 - 1000 | 硬保底抽数 |
| softPity.start | 1 - hardPity | 软保底起始 |
| guarantee.rate | 0.01 - 1.0 | 小保底UP率 |

### 8.2 配置兼容性

- 版本 2.0.0 的配置向后兼容 1.x
- 导入时会自动验证 checksum
- 不兼容的配置会给出警告

### 8.3 安全性

- 配置导出包含 checksum，防止篡改
- 导入前验证配置合法性
- 不信任来源的配置会给出警告

---

## 九、未来扩展

### 9.1 计算器扩展

- 捕获明光计算器（原神5.0+）
- 武器池定轨计算器
- 区域概率计算器（PC端游戏）

### 9.2 UI 增强

- 配置对比功能（比较不同配置）
- 批量导出（导出所有游戏配置）
- 配置模板库（预设更多游戏）

### 9.3 云端存储

- 配置云端备份
- 跨设备同步
- 社区配置分享

---

## 十、总结

增强版配置模板实现了：

✅ **完整性** - 覆盖所有主流抽卡机制
✅ **灵活性** - 支持玩家自定义配置
✅ **安全性** - checksum验证，防止篡改
✅ **易用性** - 预设模板 + 导出导入功能
✅ **可扩展** - 易于添加新的计算器类型

玩家现在可以：
- 选择预设游戏模板
- 自定义概率参数
- 导出分享配置
- 导入好友配置
- 管理多个游戏配置

---

## 附录

### A. 相关文件清单

```
config/
├── config-template-enhanced.js       # 增强版配置模板
├── games/
│   ├── genshin-enhanced.js           # 原神增强配置
│   ├── arknights-enhanced.js         # 明日方舟配置
│   ├── fgo-enhanced.js               # FGO配置
│   └── hok-enhanced.js               # 王者荣耀配置

services/
└── config-export-service.js          # 配置导出服务

pages/
└── config-manager/                   # 配置管理页面
    ├── config-manager.js
    ├── config-manager.wxml
    ├── config-manager.wxss
    └── config-manager.json

docs/
└── enhanced-config-guide.md          # 使用指南（本文件）
```

### B. 快速创建配置示例

```javascript
// 创建一个新的米哈游类游戏配置
const newGameConfig = createGameConfig('mihoyo', {
  gameId: 'zenless-zone-zero',
  name: '绝区零',
  resources: {
    primary: { id: 'polychromes', name: '菲林' },
    secondary: { id: 'signals', name: '信号检索' }
  },
  conversionRate: { primaryToPull: 160 }
});

// 验证并导出
const validation = validateEnhancedConfig(newGameConfig);
if (validation.valid) {
  const json = exportConfig(newGameConfig);
  console.log('配置导出成功');
}
```