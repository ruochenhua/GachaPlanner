# 规划页面重新设计 v2

> 基于用户反馈调整：角色和武器拆分为独立目标，攒抽预测重新设计，目标类型名称从游戏配置扩展。

---

## 核心设计变更

### 1. 目标模型：同一游戏多目标

不再是「一个目标包含多个 subTarget」，而是**一个游戏对应一个目标数组**。

```js
// 原神玩家要抽 "胡桃 0+1"
targets: [
  { id: 't1', name: '胡桃', type: 'character', desiredRank: 0, isGuaranteed: false, poolStartDate: '', poolEndDate: '' },
  { id: 't2', name: '护摩之杖', type: 'weapon', desiredRank: 1, isGuaranteed: false, poolStartDate: '', poolEndDate: '' }
]
```

每个目标独立：
- 独立的名称、类型、期望等级、大保底状态
- 独立的概率计算（角色池和武器池参数不同）
- 独立显示在 overview 的目标列表中

**类型名称从游戏配置读取**：
```js
// 游戏配置新增 targetTypes
targetTypes: {
  character: { label: '角色', maxRank: 6 },
  weapon: { label: '武器', maxRank: 5 }
}
```

原神 → 角色 / 武器  
崩铁 → 角色 / 光锥  
绝区零 → 角色 / 音擎  

### 2. 目标设定区域

```
┌─────────────────────────────────────┐
│  ▸ 设定目标                          │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [角色] 胡桃  0命  □大保底  ✕ │  │  ← 目标卡片列表
│  │ [武器] 护摩之杖 1精 □大保底  ✕ │  │
│  └───────────────────────────────┘  │
│                                     │
│  [+ 添加目标]                        │  ← 添加按钮
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ▸ 添加新目标                   │  │  ← 展开的目标表单
│  │                               │  │
│  │  目标名称 [__________]        │  │
│  │                               │  │
│  │  目标类型  [角色 ▼]           │  │  ← 从游戏配置读取选项
│  │                               │  │
│  │  期望等级  [0][1][2][3][4][5][6]│  │  ← 按钮横排，maxRank 决定个数
│  │                               │  │
│  │  大保底    [开关]              │  │
│  │                               │  │
│  │  卡池时间  [开始] ~ [结束]    │  │
│  │                               │  │
│  │  [      保存目标      ]       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

目标卡片横排紧凑展示（类似标签），点击展开编辑。

### 3. 攒抽预测重新设计

**折叠态** — 只显示关键指标：
```
┌─────────────────────────────────────┐
│  ▸ 攒抽预测               [展开 ▶] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ 当前概率 │ │ 最终概率 │ │  还需  ││  ← 三个指标卡片
│  │  45.2%  │ │  89.7%  │ │ 15天  ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  目标卡池: 2026-06-01 ~ 06-21       │
│                                     │
└─────────────────────────────────────┘
```

**展开态** — 进度条时间线：
```
┌─────────────────────────────────────┐
│  ▸ 攒抽预测               [收起 ▼] │
├─────────────────────────────────────┤
│                                     │
│  今天 ──────●─────────────── 卡池结束│  ← 进度条
│       45%        ↑ 80%        89%   │
│              建议此时抽取           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 每日收入  [____] 星琼/天      │  │
│  │ 其他获取  [____] 星琼         │  │
│  └───────────────────────────────┘  │
│                                     │
│  时间线:                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  今天    第5天    第10天   第15天   │
│  45%  →  62%  →  78%  →  89%      │
│                                     │
│  💡 建议等到卡池第10天再抽，此时    │
│     概率接近80%，性价比最高         │
│                                     │
└─────────────────────────────────────┘
```

---

## 样式规范

### 目标卡片（紧凑列表）
```css
.target-chip {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 20rpx;
  background: #FAF9F7;
  border-radius: 12rpx;
  border: 2rpx solid #E5E0D8;
}
.target-chip .type-tag {
  padding: 4rpx 10rpx;
  background: #C4A77D;
  color: white;
  border-radius: 6rpx;
  font-size: 20rpx;
}
.target-chip .target-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #2C2520;
}
.target-chip .rank-text {
  font-size: 24rpx;
  color: #7A7168;
}
```

### 等级选择按钮
```css
.rank-selector {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}
.rank-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: white;
  border: 2rpx solid #E5E0D8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #2C2520;
}
.rank-btn.active {
  background: #C4A77D;
  color: white;
  border-color: #C4A77D;
}
```

### 攒抽预测 — 指标卡片
```css
.metric-grid {
  display: flex;
  gap: 16rpx;
  margin: 24rpx 0;
}
.metric-card {
  flex: 1;
  background: #FAF9F7;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}
.metric-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #C4A77D;
}
.metric-label {
  font-size: 22rpx;
  color: #7A7168;
  margin-top: 8rpx;
}
```

### 攒抽预测 — 进度条
```css
.timeline-track {
  position: relative;
  height: 8rpx;
  background: #E5E0D8;
  border-radius: 4rpx;
  margin: 40rpx 16rpx;
}
.timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, #C4A77D, #7FB069);
  border-radius: 4rpx;
}
.timeline-marker {
  position: absolute;
  top: -16rpx;
  width: 40rpx;
  height: 40rpx;
  background: white;
  border: 4rpx solid #C4A77D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}
```

---

## 交互说明

### 添加目标
1. 点击「+ 添加目标」→ 展开目标表单
2. 选择目标类型（角色/武器/光锥...）→ 等级按钮个数自动变化（角色 0-6，武器 0-5）
3. 填写名称、选择等级、设置大保底、卡池时间
4. 点击「保存目标」→ 表单折叠，新目标卡片加入列表
5. 同一游戏同一类型重复时 → Toast 提示「已有一个角色目标，确定要再添加吗？」但不阻止

### 编辑目标
1. 点击目标卡片 → 展开该目标的编辑表单（预填充数据）
2. 修改后保存 → 更新卡片
3. 点击卡片上的 ✕ → 删除确认

### 攒抽预测
1. 折叠态显示三个关键指标 + 卡池时间
2. 点击「展开」→ 显示进度条 + 每日收入输入 + 详细时间线
3. 进度条上标注「今天」和「卡池结束」两个节点
4. 如果 probabilityTimeline 中有某个节点概率 ≥ 80%，在进度条上标注「建议此时抽取」
