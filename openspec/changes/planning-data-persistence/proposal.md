# 规划数据持久化提案

## 概述

实现规划数据的持久化存储，包括卡池时间范围、每日资源收入、目标设定等数据的保存和加载，支持跨会话数据保留。

## 动机

当前项目的规划数据存在以下问题：
- 用户每次打开小程序需要重新输入资源数据
- 卡池时间范围设置无法保存
- 每日收入配置丢失
- 目标设定无法跨会话保留

用户需要：
- 一次输入，长期保留
- 打开小程序即可看到上次的规划状态
- 数据自动保存，无需手动操作

## 目标用户

- 所有使用规划功能的用户
- 多游戏玩家（需要保存多个游戏的规划）
- 长期规划用户（需要保存历史数据）

## 用户故事

### Story 1: 资源数据持久化

作为用户，我希望我输入的资源数据能够自动保存，以便下次打开时不需要重新输入。

**验收标准**：
- 修改资源后自动保存到 storage
- 打开规划页自动加载上次的数据
- 数据与游戏 ID 绑定

### Story 2: 卡池时间持久化

作为用户，我希望卡池时间范围设置能够保存，以便下次打开时仍然有效。

**验收标准**：
- 设置卡池开始/结束时间后自动保存
- 打开规划页显示上次的卡池时间
- 时间过期后提供提醒

### Story 3: 每日收入配置持久化

作为用户，我希望每日收入配置能够保存，以便计算长期规划。

**验收标准**：
- 配置每日资源收入后自动保存
- 不同游戏可以有不同收入配置
- 收入数据用于动态概率计算

### Story 4: 目标设定持久化

作为用户，我希望我的抽卡目标能够保存，以便长期追踪进度。

**验收标准**：
- 设定目标后自动保存
- 目标包括：目标角色、目标抽数、目标时间
- 可以编辑和删除目标

### Story 5: 数据管理

作为用户，我希望管理我的规划数据，以便清理过期数据或重置。

**验收标准**：
- 查看所有保存的规划数据
- 删除单个游戏的规划数据
- 重置所有规划数据

## 范围

### 包含内容

- 规划数据存储到微信 storage
- 数据自动保存机制
- 数据加载和恢复
- 数据管理功能

### 不包含内容

- 云端备份（可在未来扩展）
- 跨设备同步（可在未来扩展）

## 功能需求

### FR-1: 数据存储核心

| 优先级 | 描述 |
|--------|------|
| P0 | 实现 `PlanningStorage` 服务类 |
| P0 | 定义数据存储 schema |
| P0 | 实现数据序列化/反序列化 |
| P0 | 数据与游戏 ID 绑定存储 |
| P1 | 数据版本管理 |

### FR-2: 自动保存

| 优先级 | 描述 |
|--------|------|
| P0 | 资源修改后自动保存 |
| P0 | 卡池时间设置后自动保存 |
| P0 | 收入配置修改后自动保存 |
| P1 | 目标设定后自动保存 |
| P1 | 保存状态提示（可选） |

### FR-3: 数据加载

| 优先级 | 描述 |
|--------|------|
| P0 | 打开规划页自动加载数据 |
| P0 | 数据加载失败时提供默认值 |
| P0 | 数据格式兼容性处理 |
| P1 | 数据迁移支持 |

### FR-4: 数据管理 UI

| 优先级 | 描述 |
|--------|------|
| P1 | 规划数据管理入口 |
| P1 | 显示已保存的数据列表 |
| P1 | 删除单个游戏数据 |
| P1 | 重置所有数据（带确认） |

## 非功能需求

- **可靠性**：数据保存成功率 > 99.9%
- **性能**：保存/加载响应时间 < 100ms
- **容量**：支持至少 20 个游戏的规划数据
- **兼容性**：支持数据格式版本升级

## 技术设计

### 数据存储 Schema

```javascript
// services/planning-storage.js

/**
 * 规划数据结构
 */
const PlanningDataSchema = {
  version: '1.0.0',
  updatedAt: '2026-04-22',
  
  // 资源数据
  resources: {
    primogems: 0,        // 原石数量
    intertwinedFates: 0, // 纠缠之缘数量
    acquaintFates: 0     // 相遇之缘数量
  },
  
  // 抽数计算
  totalPulls: 0,
  
  // 卡池时间范围
  poolTimeRange: {
    startDate: '2026-04-22',
    endDate: '2026-05-06',
    timeZone: 'Asia/Shanghai'
  },
  
  // 每日收入配置
  dailyIncome: {
    primogems: 60,       // 每日原石收入
    commissions: true,   // 是否完成每日委托
    events: 0            // 活动额外收入
  },
  
  // 目标设定
  targets: [
    {
      id: 'target-1',
      name: '抽取宵宫',
      targetType: 'character',
      targetPulls: 180,
      priority: 'high',
      createdAt: '2026-04-22'
    }
  ],
  
  // 元数据
  metadata: {
    gameId: 'genshin',
    createdAt: '2026-04-22',
    lastSavedAt: '2026-04-22'
  }
};
```

### 存储服务类

```javascript
// services/planning-storage.js

const STORAGE_KEY_PREFIX = 'gacha_planning_';
const DATA_VERSION = '1.0.0';

class PlanningStorage {
  /**
   * 保存规划数据
   */
  async savePlanningData(gameId, data) {
    const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;
    const dataToSave = {
      ...data,
      metadata: {
        ...data.metadata,
        gameId,
        lastSavedAt: new Date().toISOString()
      },
      version: DATA_VERSION
    };
    
    try {
      wx.setStorageSync(storageKey, JSON.stringify(dataToSave));
      console.log('规划数据保存成功:', gameId);
      return { success: true };
    } catch (error) {
      console.error('规划数据保存失败:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 加载规划数据
   */
  async loadPlanningData(gameId) {
    const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;
    
    try {
      const data = wx.getStorageSync(storageKey);
      if (!data) {
        return { success: true, data: this.getDefaultData(gameId) };
      }
      
      const parsed = JSON.parse(data);
      
      // 版本兼容性处理
      if (parsed.version !== DATA_VERSION) {
        return this.migrateData(parsed);
      }
      
      return { success: true, data: parsed };
    } catch (error) {
      console.error('规划数据加载失败:', error);
      return { success: false, error, data: this.getDefaultData(gameId) };
    }
  }
  
  /**
   * 删除规划数据
   */
  async deletePlanningData(gameId) {
    const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;
    
    try {
      wx.removeStorageSync(storageKey);
      console.log('规划数据删除成功:', gameId);
      return { success: true };
    } catch (error) {
      console.error('规划数据删除失败:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 获取默认数据结构
   */
  getDefaultData(gameId) {
    return {
      version: DATA_VERSION,
      resources: {
        primogems: 0,
        intertwinedFates: 0,
        acquaintFates: 0
      },
      totalPulls: 0,
      poolTimeRange: null,
      dailyIncome: {
        primogems: 0,
        commissions: false,
        events: 0
      },
      targets: [],
      metadata: {
        gameId,
        createdAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * 数据迁移（未来版本升级时使用）
   */
  migrateData(oldData) {
    // 根据版本号执行不同的迁移逻辑
    console.log('数据版本升级:', oldData.version, '->', DATA_VERSION);
    // TODO: 实现迁移逻辑
    return { success: true, data: oldData };
  }
}

module.exports = PlanningStorage;
```

### 与规划页集成

```javascript
// pages/planning/planning.js

const PlanningStorage = require('../../services/planning-storage');

Page({
  data: {
    resources: {},
    poolTimeRange: null,
    dailyIncome: {}
  },
  
  onLoad(options) {
    this.gameId = options.gameId;
    this.loadPlanningData();
  },
  
  /**
   * 加载规划数据
   */
  async loadPlanningData() {
    const result = await PlanningStorage.loadPlanningData(this.gameId);
    if (result.success) {
      this.setData({
        resources: result.data.resources,
        poolTimeRange: result.data.poolTimeRange,
        dailyIncome: result.data.dailyIncome,
        targets: result.data.targets
      });
    }
  },
  
  /**
   * 保存规划数据（在资源修改、时间设置等时候调用）
   */
  async savePlanningData() {
    const data = {
      resources: this.data.resources,
      poolTimeRange: this.data.poolTimeRange,
      dailyIncome: this.data.dailyIncome,
      targets: this.data.targets
    };
    await PlanningStorage.savePlanningData(this.gameId, data);
  },
  
  // 资源修改时自动保存
  onResourceChange(e) {
    const { key, value } = e.detail;
    this.setData({ [key]: value });
    this.savePlanningData(); // 自动保存
  },
  
  // 卡池时间设置后自动保存
  onPoolTimeChange(e) {
    this.setData({ poolTimeRange: e.detail });
    this.savePlanningData(); // 自动保存
  }
});
```

### 文件结构

```
openspec/changes/planning-data-persistence/
├── proposal.md             # 本文件
├── design.md               # 详细设计
├── tasks.md                # 任务分解
└── specs/
    └── planning-storage/
        └── spec.md         # 功能规格
```

## 依赖关系

- 依赖微信小程序的 storage API
- 依赖现有的规划页 UI
- 与现有游戏配置系统兼容

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| storage 容量限制 | 数据无法保存 | 限制单个游戏数据大小，清理过期数据 |
| 数据格式变更 | 旧数据无法加载 | 实现数据版本迁移机制 |
| 保存失败 | 数据丢失 | 保存失败时提示用户，提供重试 |

## 成功指标

- 数据保存成功率 > 99.9%
- 用户打开规划页数据加载时间 < 500ms
- 用户无需重复输入资源数据
- 数据管理功能使用率 > 30%

## 验收标准

1. 创建 `PlanningStorage` 服务类并通过单元测试
2. 规划页实现自动保存功能
3. 规划页实现数据自动加载功能
4. 数据管理 UI 完成（可选 P1 功能）
5. 与现有规划功能无缝集成

---

**创建日期**：2026-04-22  
**状态**：Proposed  
**优先级**：P2
