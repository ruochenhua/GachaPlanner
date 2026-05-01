# 配置模板库扩展 - 详细设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                  配置管理页 (UI Layer)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  预设模板库                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │ 原神        │  │ 星穹铁道    │  │ 明日方舟    │  │    │
│  │  │ 硬保底 + 大小 │  │ 硬保底 + 大小 │  │ 软保底      │  │    │
│  │  │ [导入]      │  │ [导入]      │  │ [导入]      │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  │                                                     │    │
│  │  分类筛选：[全部] [硬保底] [软保底] [无保底]        │    │
│  │  搜索：[🔍 搜索游戏名称...]                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PresetLibraryService                                │    │
│  │  - getPresetList()                                  │    │
│  │  - getPresetDetail(id)                              │    │
│  │  - importPreset(id)                                 │    │
│  │  - exportConfig(config)                             │    │
│  │  - importConfig(json)                               │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ConfigValidator                                     │    │
│  │  - validate(config)                                 │    │
│  │  - checkCompatibility(config)                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  config/games/presets/preset-library.js              │    │
│  │  [ { id, gameId, name, category, config, ... }, ]    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 预设库分类体系

```
预设模板库
│
├── hard-pity-guarantee (硬保底 + 大小保底)
│   ├── genshin         - 原神
│   ├── starrail        - 崩坏：星穹铁道
│   ├── zenless         - 绝区零
│   ├── bluearchive     - 蔚蓝档案
│   └── princessconnect - 公主连结
│
├── soft-pity (软保底)
│   ├── arknights       - 明日方舟
│   ├── girlslines      - 少女前线
│   └── nikke           - 胜利女神：妮姬
│
├── no-pity (无保底)
│   ├── fgo             - FGO
│   ├── azurlane        - 碧蓝航线
│   └── gbf             - 碧蓝幻想
│
├── luck-value (幸运值)
│   └── hok             - 王者荣耀
│
└── multi-pool (多池联动)
    └── onmyoji         - 阴阳师
```

## 组件设计

### 1. 预设模板库界面

```
┌─────────────────────────────────────────────┐
│  预设模板库                                  │
├─────────────────────────────────────────────┤
│  分类：[全部] [硬保底] [软保底] [无保底]     │
│  搜索：[🔍 输入游戏名称...]                 │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │ 原神                            热门  │ │
│  │ 类型：硬保底 + 大小保底                │ │
│  │ 更新：2026-04-22                      │ │
│  │ [预览] [导入]                         │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 崩坏：星穹铁道                        │ │
│  │ 类型：硬保底 + 大小保底                │ │
│  │ 更新：2026-04-22                      │ │
│  │ [预览] [导入]                         │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 明日方舟                              │ │
│  │ 类型：软保底                          │ │
│  │ 更新：2026-04-22                      │ │
│  │ [预览] [导入]                         │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2. 配置导入/导出流程

```
导入流程:
用户选择导入源
      ↓
读取配置数据
      ↓
JSON 解析
      ↓
格式验证 (schema)
      ↓
参数验证 (范围/逻辑)
      ↓
Checksum 校验
      ↓
版本兼容性检查
      ↓
导入成功 / 显示错误

导出流程:
用户请求导出
      ↓
收集当前配置
      ↓
添加元数据 (版本/日期)
      ↓
计算 checksum
      ↓
生成 JSON
      ↓
提供下载/复制
```

## 数据结构

### 预设配置结构

```javascript
// config/games/presets/preset-library.js

const PRESET_LIBRARY = [
  {
    id: 'genshin',
    gameId: 'genshin',
    name: '原神',
    category: 'hard-pity-guarantee',
    tags: ['二次元', '角色收集', '开放世界', '热门'],
    version: '1.0.0',
    updatedAt: '2026-04-22',
    config: {
      gameId: 'genshin',
      name: '原神',
      pityType: 'guarantee',
      baseRate: 0.006,
      hardPity: 90,
      softPityStart: 74,
      softPityIncrement: 0.06,
      guaranteeRate: 0.5,
      resources: {
        primogems: { name: '原石' },
        intertwinedFates: { name: '纠缠之缘' }
      },
      conversionRate: { primogemsToFate: 160 }
    },
    description: '米哈游原神角色祈愿配置，包含硬保底和大小保底机制',
    author: 'GachaPlaner Team',
    downloads: 0
  },
  {
    id: 'nikke',
    gameId: 'nikke',
    name: '胜利女神：妮姬',
    category: 'soft-pity',
    tags: ['二次元', '射击', '角色收集'],
    version: '1.0.0',
    updatedAt: '2026-04-22',
    config: {
      gameId: 'nikke',
      name: '胜利女神：妮姬',
      pityType: 'soft',
      baseRate: 0.02,
      softPityStart: 80,
      softPityIncrement: 0.015,
      resources: {
        gems: { name: '宝石' }
      },
      conversionRate: { gemsToPull: 10 }
    },
    description: '妮姬特别招募配置，软保底机制',
    author: 'GachaPlaner Team',
    downloads: 0
  },
  // ... 更多预设
];

module.exports = PRESET_LIBRARY;
```

### 导入/导出数据结构

```javascript
// 导出格式
{
  version: "1.0",
  exportedAt: "2026-04-22T10:30:00Z",
  gameConfig: {
    // 完整游戏配置
  },
  checksum: "sha256-abc123...",
  metadata: {
    sourceGameId: "genshin",
    sourceVersion: "1.0.0"
  }
}

// 导入验证结果
{
  success: true,
  config: { /* 验证后的配置 */ },
  warnings: ["版本号已自动更新"],
  errors: []
}
```

## 服务类设计

### PresetLibraryService

```javascript
/**
 * 预设模板库服务
 */
class PresetLibraryService {
  /**
   * 获取预设列表
   * @param {Object} filters - 筛选条件
   * @returns {Array} 预设列表
   */
  getPresetList(filters = {}) {
    const { category, search } = filters;
    let presets = PRESET_LIBRARY;

    // 分类筛选
    if (category && category !== 'all') {
      presets = presets.filter(p => p.category === category);
    }

    // 搜索
    if (search) {
      const keyword = search.toLowerCase();
      presets = presets.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.gameId.toLowerCase().includes(keyword) ||
        p.tags.some(t => t.toLowerCase().includes(keyword))
      );
    }

    return presets.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tags: p.tags,
      updatedAt: p.updatedAt,
      description: p.description
    }));
  }

  /**
   * 获取预设详情
   * @param {string} presetId - 预设 ID
   * @returns {Object} 预设详情
   */
  getPresetDetail(presetId) {
    return PRESET_LIBRARY.find(p => p.id === presetId);
  }

  /**
   * 导入预设
   * @param {string} presetId - 预设 ID
   * @returns {Object} 导入结果
   */
  importPreset(presetId) {
    const preset = this.getPresetDetail(presetId);
    if (!preset) {
      return { success: false, error: '预设不存在' };
    }

    // 深拷贝配置
    const config = JSON.parse(JSON.stringify(preset.config));
    
    return {
      success: true,
      config,
      message: `已导入「${preset.name}」配置`
    };
  }

  /**
   * 导出配置
   * @param {Object} config - 游戏配置
   * @returns {Object} 导出结果
   */
  exportConfig(config) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      gameConfig: config,
      checksum: this.calculateChecksum(config),
      metadata: {
        sourceGameId: config.gameId,
        sourceVersion: config.version
      }
    };

    return {
      success: true,
      data: exportData,
      json: JSON.stringify(exportData, null, 2)
    };
  }

  /**
   * 导入配置
   * @param {string} jsonString - JSON 字符串
   * @returns {Object} 导入结果
   */
  importConfig(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // 验证格式
      if (!data.version || !data.gameConfig) {
        return { 
          success: false, 
          error: '无效的导出格式：缺少必要字段' 
        };
      }

      // 验证 checksum
      const expectedChecksum = this.calculateChecksum(data.gameConfig);
      if (data.checksum && data.checksum !== expectedChecksum) {
        return { 
          success: false, 
          error: 'Checksum 校验失败：配置可能被篡改' 
        };
      }

      // 验证配置
      const validation = ConfigValidator.validate(data.gameConfig);
      if (!validation.valid) {
        return {
          success: false,
          error: '配置验证失败',
          errors: validation.errors
        };
      }

      return {
        success: true,
        config: data.gameConfig,
        warnings: validation.warnings || []
      };
    } catch (e) {
      return {
        success: false,
        error: `JSON 解析失败：${e.message}`
      };
    }
  }

  /**
   * 计算 checksum
   * @param {Object} config - 配置对象
   * @returns {string} checksum
   */
  calculateChecksum(config) {
    const str = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

module.exports = PresetLibraryService;
```

## 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `config/games/presets/preset-library.js` | 新增 | 预设模板库 |
| `config/games/presets/*.js` | 新增 | 各游戏预设配置 |
| `services/preset-library-service.js` | 新增 | 预设库服务 |
| `pages/config-manager/config-manager.wxml` | 修改 | 添加预设库入口 |
| `pages/config-manager/config-manager.js` | 修改 | 添加预设库逻辑 |
| `tests/services/preset-library-service.test.js` | 新增 | 服务测试 |

---

**创建日期**：2026-04-22  
**最后更新**：2026-04-22  
**版本**：1.0
