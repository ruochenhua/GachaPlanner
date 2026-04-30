# 游戏配置指南

本文档说明游戏配置文件的格式、字段含义和验证规则。

## 配置文件位置

所有游戏配置文件位于 `config/games/` 目录下，每个游戏一个 JSON 文件。

```
config/games/
├── genshin.json      # 原神
├── starrail.json     # 星铁
└── fgo.json          # FGO（示例）
```

## 配置字段说明

### 必填字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `gameId` | string | 游戏唯一标识，小写字母、数字、中划线 | `"genshin"` |
| `name` | string | 游戏显示名称 | `"原神"` |
| `pityType` | string | 保底类型：`hard`/`soft`/`none` | `"hard"` |
| `baseRate` | number | 基础概率（0-1之间） | `0.006` |
| `version` | string | 配置版本号 | `"1.0.0"` |
| `updatedAt` | string | 更新日期（YYYY-MM-DD） | `"2026-04-01"` |
| `resources` | object | 资源类型配置 | 见下文 |

### 保底参数（根据 pityType 选择）

#### 硬保底 (pityType = "hard")

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `hardPity` | number | 硬保底阈值（必填） | `90` |
| `softPityStart` | number | 软保底起始抽数（可选） | `74` |
| `softPityIncrement` | number | 软保底概率增量（可选） | `0.06` |

#### 软保底 (pityType = "soft")

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `softPityStart` | number | 软保底起始抽数（必填） | `50` |
| `softPityIncrement` | number | 每抽概率增量（必填） | `0.02` |

#### 无保底 (pityType = "none")

无需额外保底参数。

### 资源配置

```json
"resources": {
  "primogems": {
    "name": "原石",
    "icon": "/assets/images/games/primogem.png"
  },
  "intertwinedFates": {
    "name": "纠缠之缘",
    "icon": "/assets/images/games/intertwined-fate.png"
  }
}
```

### 资源转换率

```json
"conversionRate": {
  "primogemsToFate": 160
}
```

## 完整配置示例

### 原神（硬保底）

```json
{
  "gameId": "genshin",
  "name": "原神",
  "version": "1.0.0",
  "updatedAt": "2026-04-01",
  
  "pityType": "hard",
  "hardPity": 90,
  "softPityStart": 74,
  "softPityIncrement": 0.06,
  
  "baseRate": 0.006,
  
  "resources": {
    "primogems": {
      "name": "原石",
      "icon": "/assets/images/games/primogem.png"
    },
    "intertwinedFates": {
      "name": "纠缠之缘",
      "icon": "/assets/images/games/intertwined-fate.png"
    }
  },
  
  "conversionRate": {
    "primogemsToFate": 160
  },
  
  "characterProbalityUp": 0.5,
  "weaponProbalityUp": 0.75
}
```

### FGO（无保底）

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

## 验证规则

配置验证器会检查以下内容：

1. **必填字段** - 所有必填字段必须存在
2. **字段类型** - 字段类型必须正确
3. **数值范围** - 数值必须在合理范围内
4. **逻辑规则** - 保底参数必须与保底类型匹配

### 验证示例

```javascript
const { validateConfig } = require('../../core/config/config-validator');

const result = validateConfig(config);

if (result.valid) {
  console.log('配置验证通过');
} else {
  console.log('配置验证失败:', result.errors);
}
```

## 更新配置

修改配置后需要：

1. 递增版本号
2. 更新 updatedAt 日期
3. 重新验证配置
4. 清除计算器缓存