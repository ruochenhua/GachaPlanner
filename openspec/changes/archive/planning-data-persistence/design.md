# 规划数据持久化 - 详细设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      规划页 (UI Layer)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  资源输入组件                                         │    │
│  │  - 原石：[1200]                                      │    │
│  │  - 纠缠之缘：[10]                                    │    │
│  │                                                     │    │
│  │  卡池时间范围                                         │    │
│  │  - 开始：[2026-04-22]  结束：[2026-05-06]           │    │
│  │                                                     │    │
│  │  每日收入配置                                         │    │
│  │  - 每日原石：[60]                                    │    │
│  │  - 每日委托：[✓]                                     │    │
│  │                                                     │    │
│  │  目标设定                                             │    │
│  │  - [抽取宵宫] [180 抽] [高优先级]                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PlanningStorage                                     │    │
│  │  - savePlanningData(gameId, data)                   │    │
│  │  - loadPlanningData(gameId)                         │    │
│  │  - deletePlanningData(gameId)                       │    │
│  │  - getAllPlanningData()                             │    │
│  │  - migrateData(oldData)                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  微信小程序 storage                                   │    │
│  │  Key: gacha_planning_{gameId}                       │    │
│  │  Value: JSON.stringify(PlanningData)                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
用户修改资源/时间/收入/目标
            ↓
onResourceChange / onTimeChange / onIncomeChange / onTargetChange
            ↓
setData({ xxx: value })
            ↓
PlanningStorage.savePlanningData(gameId, data)  ← 自动保存
            ↓
写入 wx.setStorageSync('gacha_planning_{gameId}', JSON)
            ↓
console.log('规划数据保存成功')

---

用户打开规划页
            ↓
onLoad({ gameId })
            ↓
PlanningStorage.loadPlanningData(gameId)
            ↓
读取 wx.getStorageSync('gacha_planning_{gameId}')
            ↓
setData({ ...loadedData })
            ↓
显示上次保存的数据
```

## 数据结构

### PlanningData Schema

```javascript
/**
 * 规划数据结构 v1.0
 */
const PlanningDataSchema = {
  // 元数据
  version: '1.0.0',           // 数据 schema 版本
  schemaUpdatedAt: '2026-04-22',
  
  // 资源数据
  resources: {
    primogems: 0,             // 原石数量
    intertwinedFates: 0,      // 纠缠之缘数量
    acquaintFates: 0          // 相遇之缘数量
  },
  
  // 抽数计算（自动计算，不存储）
  // totalPulls = floor(primogems / 160) + intertwinedFates
  
  // 卡池时间范围
  poolTimeRange: {
    startDate: '2026-04-22',  // ISO 日期格式
    endDate: '2026-05-06',
    timeZone: 'Asia/Shanghai'
  },
  
  // 每日收入配置
  dailyIncome: {
    primogems: 60,            // 每日原石收入
    commissions: true,        // 是否完成每日委托
    events: 0,                // 活动额外收入
    exploration: 0,           // 探索收入
    other: 0                  // 其他收入
  },
  
  // 目标设定
  targets: [
    {
      id: 'target-uuid-1',
      name: '抽取宵宫',
      targetType: 'character',  // character | weapon | general
      targetPulls: 180,         // 目标抽数
      priority: 'high',         // high | medium | low
      notes: '为了宵宫！',
      createdAt: '2026-04-22T10:00:00Z',
      updatedAt: '2026-04-22T10:00:00Z'
    }
  ],
  
  // 幸运值（王者荣耀用）
  luckValue: {
    current: 240,             // 当前幸运值
    max: 361                  // 最大幸运值
  },
  
  // 多池信息（阴阳师用）
  multiPool: {
    enabled: false,
    pools: [],
    sharedPityCount: 0
  },
  
  // 元数据
  metadata: {
    gameId: 'genshin',        // 游戏 ID
    createdAt: '2026-04-22T10:00:00Z',
    lastSavedAt: '2026-04-22T12:30:00Z',
    saveCount: 15             // 保存次数
  }
};
```

## 类设计

### PlanningStorage

```javascript
// services/planning-storage.js

const STORAGE_KEY_PREFIX = 'gacha_planning_';
const DATA_VERSION = '1.0.0';

/**
 * 规划数据持久化服务
 */
class PlanningStorage {
  /**
   * 获取存储 key
   * @param {string} gameId - 游戏 ID
   * @returns {string} 存储 key
   */
  _getStorageKey(gameId) {
    return `${STORAGE_KEY_PREFIX}${gameId}`;
  }

  /**
   * 保存规划数据
   * @param {string} gameId - 游戏 ID
   * @param {Object} data - 规划数据
   * @returns {Object} 保存结果
   */
  async savePlanningData(gameId, data) {
    const storageKey = this._getStorageKey(gameId);
    
    const dataToSave = {
      ...data,
      version: DATA_VERSION,
      metadata: {
        ...data.metadata,
        gameId,
        lastSavedAt: new Date().toISOString(),
        saveCount: (data.metadata?.saveCount || 0) + 1
      }
    };

    try {
      wx.setStorageSync(storageKey, JSON.stringify(dataToSave));
      console.log('规划数据保存成功:', gameId, dataToSave.metadata);
      return { success: true, data: dataToSave };
    } catch (error) {
      console.error('规划数据保存失败:', gameId, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 加载规划数据
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 加载结果
   */
  async loadPlanningData(gameId) {
    const storageKey = this._getStorageKey(gameId);

    try {
      const rawData = wx.getStorageSync(storageKey);
      
      if (!rawData) {
        return { 
          success: true, 
          data: this._getDefaultData(gameId),
          isNew: true 
        };
      }

      const parsed = JSON.parse(rawData);

      // 版本兼容性处理
      if (parsed.version !== DATA_VERSION) {
        return this._migrateData(parsed, gameId);
      }

      return { 
        success: true, 
        data: parsed,
        isNew: false 
      };
    } catch (error) {
      console.error('规划数据加载失败:', gameId, error);
      return { 
        success: false, 
        error: error.message,
        data: this._getDefaultData(gameId),
        isNew: true 
      };
    }
  }

  /**
   * 删除规划数据
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 删除结果
   */
  async deletePlanningData(gameId) {
    const storageKey = this._getStorageKey(gameId);

    try {
      wx.removeStorageSync(storageKey);
      console.log('规划数据删除成功:', gameId);
      return { success: true };
    } catch (error) {
      console.error('规划数据删除失败:', gameId, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取所有规划数据
   * @returns {Array} 所有游戏的规划数据列表
   */
  getAllPlanningData() {
    const info = wx.getStorageInfoSync();
    const keys = info.keys || [];
    const planningKeys = keys.filter(k => k.startsWith(STORAGE_KEY_PREFIX));

    const result = [];
    for (const key of planningKeys) {
      try {
        const data = wx.getStorageSync(key);
        if (data) {
          const parsed = JSON.parse(data);
          result.push({
            gameId: key.replace(STORAGE_KEY_PREFIX, ''),
            metadata: parsed.metadata,
            resources: parsed.resources,
            targets: parsed.targets
          });
        }
      } catch (e) {
        console.error('读取规划数据失败:', key, e);
      }
    }

    return result;
  }

  /**
   * 获取默认数据结构
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 默认数据
   */
  _getDefaultData(gameId) {
    return {
      version: DATA_VERSION,
      resources: {
        primogems: 0,
        intertwinedFates: 0,
        acquaintFates: 0
      },
      poolTimeRange: null,
      dailyIncome: {
        primogems: 0,
        commissions: false,
        events: 0,
        exploration: 0,
        other: 0
      },
      targets: [],
      luckValue: {
        current: 0,
        max: 361
      },
      multiPool: {
        enabled: false,
        pools: [],
        sharedPityCount: 0
      },
      metadata: {
        gameId,
        createdAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        saveCount: 0
      }
    };
  }

  /**
   * 数据迁移（未来版本升级时使用）
   * @param {Object} oldData - 旧版本数据
   * @param {string} gameId - 游戏 ID
   * @returns {Object} 迁移结果
   */
  _migrateData(oldData, gameId) {
    console.log('数据版本迁移:', oldData.version, '->', DATA_VERSION);
    
    let migrated = { ...oldData };

    // v1.0 -> v1.1 迁移逻辑示例
    // if (oldData.version === '1.0') {
    //   migrated = {
    //     ...oldData,
    //     newField: 'defaultValue'
    //   };
    // }

    migrated.version = DATA_VERSION;
    migrated.metadata = {
      ...migrated.metadata,
      lastSavedAt: new Date().toISOString()
    };

    // 保存迁移后的数据
    this.savePlanningData(gameId, migrated);

    return { success: true, data: migrated };
  }
}

module.exports = PlanningStorage;
```

## 与规划页集成

### planning.js

```javascript
// pages/planning/planning.js

const PlanningStorage = require('../../services/planning-storage');

Page({
  data: {
    gameId: '',
    resources: {
      primogems: 0,
      intertwinedFates: 0,
      acquaintFates: 0
    },
    poolTimeRange: null,
    dailyIncome: {
      primogems: 60,
      commissions: true
    },
    targets: []
  },

  onLoad(options) {
    this.gameId = options.gameId;
    this.loadPlanningData();
  },

  /**
   * 加载规划数据
   */
  async loadPlanningData() {
    wx.showLoading({ title: '加载中...' });
    
    const result = await PlanningStorage.loadPlanningData(this.gameId);
    
    wx.hideLoading();
    
    if (result.success) {
      const { resources, poolTimeRange, dailyIncome, targets } = result.data;
      this.setData({
        resources,
        poolTimeRange,
        dailyIncome,
        targets
      });
      
      if (result.isNew) {
        console.log('首次加载，使用默认数据');
      } else {
        console.log('加载已保存的规划数据');
      }
    } else {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 保存规划数据
   */
  async savePlanningData() {
    const data = {
      resources: this.data.resources,
      poolTimeRange: this.data.poolTimeRange,
      dailyIncome: this.data.dailyIncome,
      targets: this.data.targets
    };
    
    const result = await PlanningStorage.savePlanningData(this.gameId, data);
    
    if (!result.success) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  },

  /**
   * 资源变化处理
   */
  onResourceChange(e) {
    const { key, value } = e.detail;
    this.setData({ resources: { ...this.data.resources, [key]: value } });
    this.savePlanningData(); // 自动保存
  },

  /**
   * 卡池时间变化处理
   */
  onPoolTimeChange(e) {
    this.setData({ poolTimeRange: e.detail });
    this.savePlanningData(); // 自动保存
  },

  /**
   * 每日收入变化处理
   */
  onDailyIncomeChange(e) {
    const { key, value } = e.detail;
    this.setData({ dailyIncome: { ...this.data.dailyIncome, [key]: value } });
    this.savePlanningData(); // 自动保存
  },

  /**
   * 目标变化处理
   */
  onTargetChange(e) {
    const { action, target } = e.detail;
    let targets = [...this.data.targets];
    
    if (action === 'add') {
      targets.push({
        ...target,
        id: `target-${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    } else if (action === 'update') {
      targets = targets.map(t => 
        t.id === target.id ? { ...target, updatedAt: new Date().toISOString() } : t
      );
    } else if (action === 'delete') {
      targets = targets.filter(t => t.id !== target.id);
    }
    
    this.setData({ targets });
    this.savePlanningData(); // 自动保存
  }
});
```

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `services/planning-storage.js` | 新增 | 规划数据存储服务 |
| `pages/planning/planning.js` | 修改 | 添加数据加载/保存逻辑 |
| `pages/planning/planning.wxml` | 修改 | 添加目标管理 UI |
| `pages/planning/planning.wxss` | 修改 | 目标管理样式 |
| `tests/services/planning-storage.test.js` | 新增 | 服务单元测试 |
| `tests/integration/planning-storage-integration.test.js` | 新增 | 集成测试 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22  
**版本**：1.0
