# Spec: 游戏配置模型（增强版）

## 完整字段定义

```typescript
interface GameConfig {
  // ===== 基础信息 =====
  gameId: string;              // 游戏唯一标识（英文小写，如 'genshin'）
  name: string;                // 游戏显示名称（中文）
  version: string;             // 配置版本（语义化版本）
  updatedAt: string;           // 更新日期（YYYY-MM-DD）

  // ===== 保底机制 =====
  pityType: 'hard' | 'soft' | 'guarantee' | 'luck' | 'multi-pool' | 'none';
  baseRate: number;            // 基础概率（0.001 - 1.0）

  // 硬保底
  hardPity: {
    enabled: boolean;
    count: number;             // 硬保底抽数（1 - 1000）
    resetOnSuccess: boolean;   // 成功后是否重置计数器
  };

  // 软保底
  softPity: {
    enabled: boolean;
    start: number;             // 软保底起始抽数
    increment: number;         // 每抽概率增量
    maxRate: number;           // 最大概率上限
  };

  // 大小保底
  guarantee: {
    enabled: boolean;
    rate: number;              // 小保底 UP 概率
    captureLight: boolean;     // 是否启用捕获明光机制
    captureLightRate: number;  // 捕获明光 UP 概率
  };

  // 幸运值机制（王者荣耀类）
  luckValue: {
    enabled: boolean;
    maxValue: number;          // 幸运值上限
    incrementPerPull: number;  // 每次失败增加的幸运值
    ratePerLuck: number;       // 每点幸运值增加的概率（可选）
    guaranteeAtMax: boolean;   // 达到上限是否必定成功
  };

  // 多池联动（阴阳师类）
  multiPool: {
    enabled: boolean;
    sharedPity: boolean;       // 是否共享保底计数
    pools: Array<{
      poolId: string;
      name: string;
      items: string[];
      pityType: string;
    }>;
  };

  // 保底继承
  pityInheritance: {
    enabled: boolean;
    crossPool: boolean;        // 是否跨池继承
    expirationDays: number;    // 保底计数过期天数（0=永不过期）
  };

  // ===== 资源定义 =====
  resources: {
    primary: {
      id: string;              // 资源 ID
      name: string;            // 资源名称
      icon: string;            // 图标路径
      type: 'primary';         // 资源类型
    };
    secondary?: {
      id: string;
      name: string;
      icon: string;
      type: 'secondary';
    };
  };

  // 转换率
  conversionRate: {
    primaryToPull: number;     // 多少 primary 资源 = 1 抽
  };

  // ===== 目标类型 =====
  targetTypes: {
    [typeId: string]: {
      label: string;           // 显示名称（如 '角色'、'武器'）
      maxRank: number;         // 最大命座/精炼数
      hardPity: number;        // 该类目标的硬保底抽数
      guaranteeRate: number;   // UP 概率
    };
  };

  // ===== 元数据（Game Selector 用）=====
  metadata: {
    category: 'RPG' | '动作' | '策略' | '卡牌' | '休闲' | '其他';
    tags: string[];            // 标签数组（如 ['开放世界', '二次元']）
    hotScore: number;          // 热度分 0-100
    isNew: boolean;            // 新上线标记
    isFeatured: boolean;       // 推荐标记
    sortKey: string;           // 拼音排序键（小写，如 'yuanshen'）
    publisher?: string;        // 厂商（可选）
  };
}
```

## 旧字段 → 新字段映射表

| 旧字段（基础版） | 新字段（增强版） | 说明 |
|-----------------|-----------------|------|
| `pityType` | `pityType` | 值不变 |
| `hardPity` | `hardPity.count` | 需包入对象 |
| `softPityStart` | `softPity.start` | 需包入对象，新增 `increment`/`maxRate` |
| `softPityIncrement` | `softPity.increment` | 需包入对象 |
| `baseRate` | `baseRate` | 值不变 |
| `guaranteeRate` | `guarantee.rate` | 需包入对象 |
| `captureLightRate` | `guarantee.captureLightRate` | 需包入对象，新增 `captureLight` 开关 |
| `resources.primogems` | `resources.primary` | 结构扁平化 |
| `resources.intertwinedFates` | `resources.secondary` | 结构扁平化 |
| `conversionRate.primogemsToFate` | `conversionRate.primaryToPull` | 字段名统一 |
| `characterProbalityUp` | `targetTypes.character.guaranteeRate` | 移入 targetTypes |
| `weaponProbalityUp` | `targetTypes.weapon.guaranteeRate` | 移入 targetTypes |
| `targetTypes.character.hardPity` | `targetTypes.character.hardPity` | 值不变 |
| `targetTypes.weapon.hardPity` | `targetTypes.weapon.hardPity` | 值不变 |
| （新增） | `metadata` | 全新字段 |
| （新增） | `luckValue` | 全新字段（王者荣耀类） |
| （新增） | `multiPool` | 全新字段（阴阳师类） |
| （新增） | `pityInheritance` | 全新字段 |

## 游戏列表

当前计划注册的游戏：

| gameId | name | category | pityType | 备注 |
|--------|------|----------|----------|------|
| genshin | 原神 | RPG | guarantee | 硬保底 + 软保底 + 大小保底 |
| starrail | 崩坏：星穹铁道 | RPG | guarantee | 同原神机制 |
| arknights | 明日方舟 | 策略 | soft | 软保底，无大小保底 |
| fgo | Fate/Grand Order | 卡牌 | none | 无保底机制 |
| hok | 王者荣耀 | 休闲 | luck | 幸运值机制（积分夺宝） |
| onmyoji | 阴阳师 | RPG | multi-pool | 多池联动共享保底 |
