---
title: '玩家可配置概率参数'
type: 'feature'
created: '2026-04-12'
status: 'done'
baseline_commit: 'NO_VCS'
context: ['_bmad-output/planning-artifacts/architecture.md']
---

## Intent

**Problem:** 概率计算规则（baseRate、hardPity、softPityStart等）硬编码在游戏配置JSON中，玩家无法根据个人理解或官方公告调整这些参数。当官方调整概率机制时，玩家只能等待开发者更新配置文件。

**Approach:** 新增规则设置页面，让玩家可以自定义概率参数。扩展storage-service存储用户自定义参数，修改config-loader优先加载用户配置，实现参数修改后概率实时更新。

## Boundaries & Constraints

**Always:**
- 用户自定义参数存储在本地，不影响其他玩家
- 参数修改后概率计算立即更新
- 每个游戏的参数独立配置
- 提供重置为默认值功能

**Ask First:**
- 是否需要参数修改的二次确认

**Never:**
- 不修改JSON配置文件的原始数据
- 不允许参数超出合理范围（如baseRate不能为负数）
- 不影响其他游戏的默认配置

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 用户首次进入设置页 | 无自定义参数 | 显示默认参数值，参数来源标签显示"默认" | 正常显示 |
| 用户修改baseRate | 输入0.01 | 参数保存成功，概率计算更新 | 验证范围(0-1) |
| 用户修改hardPity | 输入80 | 参数保存成功，概率计算更新 | 验证范围(1-200) |
| 用户输入非法值 | 输入-1或空值 | 显示错误提示，不保存 | Toast提示 |
| 用户重置参数 | 点击重置按钮 | 参数恢复默认值，清除自定义配置 | 二次确认 |
| 切换游戏 | 从原神切换星铁 | 显示星铁的默认或自定义参数 | 正常切换 |

## Code Map

- `config/config-loader.js` -- 需扩展，优先加载用户自定义参数
- `services/storage-service.js` -- 需扩展，存储用户自定义参数
- `pages/profile/profile.js` -- 需添加跳转到规则设置页
- `pages/profile/profile.wxml` -- 需添加规则设置入口
- `pages/rule-settings/rule-settings.js` -- 新增规则设置页面逻辑
- `pages/rule-settings/rule-settings.wxml` -- 新增规则设置页面模板
- `pages/rule-settings/rule-settings.wxss` -- 新增规则设置页面样式
- `pages/rule-settings/rule-settings.json` -- 新增规则设置页面配置

## Tasks & Acceptance

**Execution:**
- [ ] `services/storage-service.js` -- 新增 `loadCustomRuleSettings(gameId)` 和 `saveCustomRuleSettings(gameId, settings)` 方法
- [ ] `config/config-loader.js` -- 修改 `loadGameConfig(gameId)` 优先合并用户自定义参数
- [ ] `pages/profile/profile.wxml` -- 新增"规则设置"入口项
- [ ] `pages/rule-settings/*` -- 创建规则设置页面（JS、WXML、WXSS、JSON）
- [ ] `pages/rule-settings/rule-settings.js` -- 实现参数编辑、验证、保存、重置逻辑
- [ ] `pages/rule-settings/rule-settings.wxml` -- 实现参数编辑UI（滑块+数字输入）
- [ ] 验证概率计算实时更新 -- 修改参数后返回首页/规划页检查概率变化

**Acceptance Criteria:**
- Given 用户进入规则设置页，when 页面加载，then 显示当前游戏的默认或自定义概率参数
- Given 用户修改参数，when 点击保存，then 参数存储到本地，概率计算立即更新
- Given 用户输入非法参数，when 超出范围，then 显示错误提示，不保存
- Given 用户点击重置，when 确认重置，then 参数恢复默认值，自定义配置被清除
- Given 用户切换游戏，when 进入规则设置页，then 显示该游戏的参数设置

## Spec Change Log

## Design Notes

### 数据结构设计

```javascript
// storage-service.js 扩展
// 用户自定义规则设置存储结构
userData.customRuleSettings = {
  genshin: {
    baseRate: 0.006,           // 自定义基础概率
    hardPity: 90,              // 自定义硬保底阈值
    softPityStart: 74,         // 自定义软保底起始
    softPityIncrement: 0.06,   // 自定义软保底提升率
    isCustom: true,            // 是否使用自定义参数
    updatedAt: '2026-04-12T...' // 更新时间
  },
  starrail: {
    // 同样结构
  }
}
```

### config-loader 修改逻辑

```javascript
function loadGameConfig(gameId) {
  const baseConfig = GAME_CONFIGS[gameId];
  if (!baseConfig) {
    return error(`游戏配置不存在：${gameId}`);
  }

  // 尝试加载用户自定义参数
  const customSettings = storageService.loadCustomRuleSettings(gameId);
  if (customSettings.success && customSettings.data?.isCustom) {
    // 合并自定义参数到基础配置
    const mergedConfig = {
      ...baseConfig,
      baseRate: customSettings.data.baseRate,
      hardPity: customSettings.data.hardPity,
      softPityStart: customSettings.data.softPityStart,
      softPityIncrement: customSettings.data.softPityIncrement,
      _isCustom: true  // 标记使用了自定义参数
    };
    return success(mergedConfig);
  }

  return success(baseConfig);
}
```

### 规则设置页面UI

```
┌─────────────────────────────────────┐
│ 规则设置 - 原神                      │
├─────────────────────────────────────┤
│                                     │
│ 📌 基础概率                         │
│ ████████████░░░░░░░ 0.6%           │
│ [0.001 - 0.1]                       │
│                                     │
│ 📌 硬保底阈值                        │
│ ████████████████████ 90抽          │
│ [1 - 200]                           │
│                                     │
│ 📌 软保底起始                        │
│ ████████████████░░ 74抽            │
│ [1 - hardPity]                      │
│                                     │
│ 📌 软保底提升率                      │
│ ████████░░░░░░░░░░ 6%              │
│ [0.01 - 0.1]                        │
│                                     │
│ ┌─────────────┐  ┌─────────────┐   │
│ │  重置默认   │  │   保存设置   │   │
│ └─────────────┘  └─────────────┘   │
│                                     │
│ 参数来源: 自定义 (更新于2026-04-12) │
└─────────────────────────────────────┘
```

## Verification

**Manual checks:**
- 进入规则设置页，检查默认参数是否正确显示
- 修改baseRate为0.01，保存后检查首页概率是否变化
- 输入非法值（如-1），检查是否有错误提示
- 点击重置，检查参数是否恢复默认
- 切换游戏后检查参数是否正确切换