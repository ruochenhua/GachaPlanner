# 主流抽卡游戏概率机制调研报告

生成时间：2026-04-19

---

## 一、调研范围

本次调研涵盖以下主流抽卡游戏：
- 原神 (Genshin Impact)
- 崩坏：星穹铁道 (Honkai: Star Rail)
- 绝区零 (Zenless Zone Zero)
- 明日方舟 (Arknights)
- FGO (Fate/Grand Order)
- 碧蓝航线 (Azur Lane)
- 王者荣耀（积分夺宝）
- 阴阳师

---

## 二、概率机制分类

### 2.1 硬保底 + 软保底 + 大小保底（米哈游系）

**代表游戏**：原神、崩铁、绝区零

#### 核心参数

| 参数 | 原神 | 崩铁 | 绝区零 |
|------|------|------|--------|
| 基础概率 | 0.6% | 0.6% | 0.6% |
| 硬保底 | 90抽 | 90抽 | 90抽 |
| 软保底起始 | 74抽 | 74抽 | 类似 |
| 软保底增量 | 6%/抽 | 6%/抽 | 类似 |
| 小保底UP率 | 50% | 50% | 50% |

#### 计算逻辑

```
1. 软保底区间（74-89抽）：
   p(n) = baseRate + (n - 73) * softPityIncrement

2. 硬保底（90抽）：
   p(90) = 100%

3. 大小保底机制：
   - 小保底：获得5星时，50%概率是UP角色
   - 大保底：上次5星歪了，下次5星必定UP
   - 状态机：小保底状态 ⇄ 大保底状态 → 已获得UP
```

#### 数学公式

**状态转移矩阵**：
```
状态定义：
- S0: 小保底状态概率
- S1: 大保底状态概率
- S2: 已获得UP概率

每抽转移：
S0' = S0 * (1 - fiveStarRate)
S1' = S0 * fiveStarRate * (1 - guaranteeRate) + S1 * (1 - fiveStarRate)
S2' = S2 + S0 * fiveStarRate * guaranteeRate + S1 * fiveStarRate
```

---

### 2.2 软保底 + 无大小保底（明日方舟）

**代表游戏**：明日方舟

#### 核心参数

| 参数 | 明日方舟 |
|------|----------|
| 基础概率 | 2% |
| 硬保底 | 无 |
| 软保底起始 | 50抽 |
| 软保底增量 | 2%/抽 |
| 最大概率 | 100% |

#### 计算逻辑

```
1. 基础区间（1-49抽）：
   p(n) = 2%

2. 软保底区间（50抽+）：
   p(n) = 2% + (n - 49) * 2%

3. 无硬保底，但概率会递增至100%
```

#### 特点
- 无大小保底机制
- 无硬保底，但软保底足够强
- 概率提升相对平缓

---

### 2.3 纯概率无保底（FGO、碧蓝航线）

**代表游戏**：FGO、碧蓝航线

#### 核心参数

| 参数 | FGO | 碧蓝航线 |
|------|-----|----------|
| 基础概率 | 1% | 2% (SSR) |
| 保底机制 | 无 | 无 |
| 大小保底 | 无 | 无 |

#### 计算逻辑

```
累积概率：
P(n) = 1 - (1 - p)^n

期望抽数：
E = 1 / p
```

#### 特点
- 最"赌狗"的机制
- 无保底保护
- 欧非差距极大
- 需要大量资源储备

---

### 2.4 硬保底 + 无软保底（王者荣耀）

**代表游戏**：王者荣耀（积分夺宝）

#### 核心参数

| 参数 | 王者荣耀 |
|------|----------|
| 基础概率 | ~0.5% |
| 硬保底 | 361次（满幸运值） |
| 软保底 | 无 |
| 幸运值机制 | 每次失败+1幸运值 |

#### 计算逻辑

```
1. 基础区间：
   p(n) = baseRate

2. 硬保底：
   p(361) = 100%

3. 幸运值机制：
   每次失败累积幸运值，达到361必定成功
```

---

### 2.5 多池保底共享（阴阳师）

**代表游戏**：阴阳师

#### 核心参数

| 参数 | 阴阳师 |
|------|--------|
| 基础概率 | 1% (SP/SSR) |
| 硬保底 | 400抽（SP活动） |
| 保底共享 | 多个卡池共享保底计数 |
| 概率UP | 特定活动期间提升 |

#### 特点
- 保底计数可跨池继承
- 活动期间概率UP
- 复杂的多池联动机制

---

## 三、概率机制对比矩阵

| 游戏类型 | 基础概率 | 硬保底 | 软保底 | 大小保底 | 保底继承 | 多池联动 |
|----------|----------|--------|--------|----------|----------|----------|
| 原神 | 0.6% | 90 | ✓ | ✓ | ✓ | ✗ |
| 崩铁 | 0.6% | 90 | ✓ | ✓ | ✓ | ✗ |
| 绝区零 | 0.6% | 90 | ✓ | ✓ | ✓ | ✗ |
| 明日方舟 | 2% | ✗ | ✓ | ✗ | ✗ | ✗ |
| FGO | 1% | ✗ | ✗ | ✗ | ✗ | ✗ |
| 碧蓝航线 | 2% | ✗ | ✗ | ✗ | ✗ | ✗ |
| 王者荣耀 | 0.5% | 361 | ✗ | ✗ | ✓ | ✗ |
| 阴阳师 | 1% | 400 | ✗ | ✗ | ✓ | ✓ |

---

## 四、通用配置模板设计

### 4.1 配置模板结构

```json
{
  "gameId": "game-identifier",
  "name": "游戏名称",
  "version": "1.0.0",
  "updatedAt": "2026-04-19",

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
    "rate": 0.5,
    "description": "小保底UP概率"
  },

  "pityInheritance": {
    "enabled": true,
    "crossPool": false
  },

  "resources": {
    "primary": {
      "id": "primogems",
      "name": "原石",
      "icon": "/assets/primogem.png"
    },
    "secondary": {
      "id": "fates",
      "name": "纠缠之缘",
      "icon": "/assets/fate.png"
    }
  },

  "conversionRate": {
    "primaryToPull": 160
  },

  "pools": [
    {
      "poolId": "character",
      "name": "角色祈愿",
      "items": ["5星角色", "4星武器"]
    }
  ]
}
```

### 4.2 配置字段说明

#### 必填字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `gameId` | string | 游戏唯一标识 | "genshin" |
| `name` | string | 游戏名称 | "原神" |
| `pityType` | string | 保底类型 | "hard", "soft", "none", "guarantee" |
| `baseRate` | number | 基础概率（0-1） | 0.006 |

#### 硬保底配置

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `hardPity.enabled` | boolean | 是否启用硬保底 | false |
| `hardPity.count` | number | 硬保底抽数 | 90 |
| `hardPity.resetOnSuccess` | boolean | 成功后是否重置 | true |

#### 软保底配置

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `softPity.enabled` | boolean | 是否启用软保底 | false |
| `softPity.start` | number | 软保底起始抽数 | 74 |
| `softPity.increment` | number | 每抽概率增量 | 0.06 |
| `softPity.maxRate` | number | 最大概率上限 | 1.0 |

#### 大小保底配置

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `guarantee.enabled` | boolean | 是否启用大小保底 | false |
| `guarantee.rate` | number | 小保底UP概率 | 0.5 |

#### 保底继承配置

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `pityInheritance.enabled` | boolean | 是否允许保底继承 | true |
| `pityInheritance.crossPool` | boolean | 是否跨池继承 | false |

---

## 五、预设游戏配置模板

### 5.1 米哈游系模板（原神/崩铁/绝区零）

```json
{
  "gameId": "mihoyo-template",
  "name": "米哈游游戏模板",
  "pityType": "guarantee",
  "baseRate": 0.006,

  "hardPity": {
    "enabled": true,
    "count": 90
  },

  "softPity": {
    "enabled": true,
    "start": 74,
    "increment": 0.06
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

### 5.2 明日方舟模板

```json
{
  "gameId": "arknights-template",
  "name": "明日方舟模板",
  "pityType": "soft",
  "baseRate": 0.02,

  "hardPity": {
    "enabled": false
  },

  "softPity": {
    "enabled": true,
    "start": 50,
    "increment": 0.02
  },

  "guarantee": {
    "enabled": false
  }
}
```

### 5.3 FGO模板

```json
{
  "gameId": "fgo-template",
  "name": "FGO模板",
  "pityType": "none",
  "baseRate": 0.01,

  "hardPity": {
    "enabled": false
  },

  "softPity": {
    "enabled": false
  },

  "guarantee": {
    "enabled": false
  }
}
```

### 5.4 王者荣耀模板

```json
{
  "gameId": "hok-template",
  "name": "王者荣耀模板",
  "pityType": "hard",
  "baseRate": 0.005,

  "hardPity": {
    "enabled": true,
    "count": 361
  },

  "softPity": {
    "enabled": false
  },

  "guarantee": {
    "enabled": false
  }
}
```

---

## 六、玩家可配置功能设计

### 6.1 配置界面设计

#### 基础配置区
- 游戏名称（文本输入）
- 基础概率（百分比输入，0.1% - 100%）
- 保底类型选择（下拉菜单）

#### 保底配置区（根据保底类型动态显示）

**硬保底配置**：
- 硬保底抽数（数字输入）
- 成功后重置（开关）

**软保底配置**：
- 软保底起始抽数（数字输入）
- 每抽概率增量（百分比输入）
- 最大概率上限（百分比输入）

**大小保底配置**：
- 小保底UP概率（百分比输入）
- 当前保底状态（小保底/大保底选择）

#### 高级配置区
- 保底继承（开关）
- 跨池继承（开关）
- 自定义资源名称和图标

### 6.2 配置验证规则

```javascript
const validationRules = {
  baseRate: {
    min: 0.001,
    max: 1.0,
    message: "基础概率必须在 0.1% - 100% 之间"
  },

  hardPity: {
    min: 1,
    max: 1000,
    message: "硬保底抽数必须在 1 - 1000 之间"
  },

  softPity: {
    startMin: 1,
    incrementMin: 0.001,
    incrementMax: 1.0,
    message: "软保底参数不合法"
  },

  guarantee: {
    rateMin: 0.01,
    rateMax: 1.0,
    message: "小保底UP概率必须在 1% - 100% 之间"
  }
};
```

### 6.3 配置导出/导入功能

**导出格式**：
```json
{
  "version": "1.0",
  "exportedAt": "2026-04-19",
  "gameConfig": { /* 完整配置 */ },
  "checksum": "sha256-hash"
}
```

**导入验证**：
- JSON格式验证
- 版本兼容性检查
- 参数合法性验证
- checksum校验

---

## 七、计算器扩展建议

### 7.1 新增计算器类型

基于调研结果，建议新增以下计算器：

1. **幸运值计算器**（王者荣耀）
   - 支持幸运值累积机制
   - 每次失败增加幸运值
   - 幸运值达到上限必定成功

2. **多池联动计算器**（阴阳师）
   - 支持多池保底共享
   - 跨池保底计数继承
   - 多池综合概率计算

3. **动态概率计算器**（已实现）
   - 支持卡池时间范围
   - 概率随时间变化
   - 考虑每日资源收入

### 7.2 计算器工厂扩展

```javascript
static calculators = {
  'hard': HardPityCalculator,
  'soft': SoftPityCalculator,
  'none': NoPityCalculator,
  'guarantee': GuaranteeCalculator,
  'luck': LuckValueCalculator,        // 新增
  'multi-pool': MultiPoolCalculator,  // 新增
  'dynamic': DynamicProbabilityCalculator  // 已实现
};
```

---

## 八、实现优先级建议

### P0（必须实现）
- ✅ 硬保底计算器
- ✅ 软保底计算器
- ✅ 无保底计算器
- ✅ 大小保底计算器
- ⏳ 玩家可配置界面（Story 5.9）

### P1（重要功能）
- ⏳ 动态概率计算器（Story 2.10）
- ⏳ 多游戏综合概率（Story 2.11）
- 🔲 配置导出/导入
- 🔲 配置验证增强

### P2（增强功能）
- 🔲 幸运值计算器
- 🔲 多池联动计算器
- 🔲 自定义资源类型
- 🔲 历史配置版本管理

---

## 九、总结

### 9.1 主流机制覆盖情况

| 机制类型 | 覆盖率 | 实现状态 |
|----------|--------|----------|
| 硬保底 | 100% | ✅ 已实现 |
| 软保底 | 100% | ✅ 已实现 |
| 无保底 | 100% | ✅ 已实现 |
| 大小保底 | 100% | ✅ 已实现 |
| 动态概率 | 80% | ⏳ 进行中 |
| 幸运值 | 0% | 🔲 未实现 |
| 多池联动 | 0% | 🔲 未实现 |

### 9.2 配置模板优势

1. **灵活性**：支持所有主流抽卡机制
2. **可扩展**：易于添加新的计算器类型
3. **用户友好**：玩家可自定义配置
4. **验证完善**：严格的参数验证机制
5. **导出导入**：支持配置分享

### 9.3 下一步行动

1. 实现 Story 5.9（玩家可配置概率参数）
2. 实现 Story 2.10（动态概率计算）
3. 实现 Story 2.11（多游戏综合概率）
4. 设计并实现配置导出/导入功能
5. 编写用户配置指南文档

---

## 参考资料

- 原神祈愿机制：https://genshin-impact.fandom.com/wiki/Wishes
- 崩铁跃迁机制：https://honkai-star-rail.fandom.com/wiki/Warp
- 明日方舟寻访机制：https://arknights.fandom.com/wiki/Headhunting
- 项目现有代码：E:\Projects\GachaPlaner\core\calculator\
