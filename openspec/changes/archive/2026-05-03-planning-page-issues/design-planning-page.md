# 规划页面重新设计

## 设计原则

1. **目标优先**：玩家打开页面的第一目的就是「设定/查看目标」，目标区域必须是视觉焦点
2. **信息分层**：核心信息（目标、概率）突出，次要信息（版本、详细图表）弱化或折叠
3. **呼吸感**：卡片之间有充足留白，字段之间有清晰分隔，避免视觉拥挤
4. **一致性**：统一卡片样式、统一输入框高度、统一按钮规范、统一颜色语义

---

## 页面整体布局（从上到下）

```
┌─────────────────────────────────────┐
│  游戏名称                            │  ← 页面标题，大字突出
│  资源管理                            │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎯 设定目标                    │  │  ← 核心卡片，强调色边框
│  │                               │  │
│  │  [快捷选择: 0+0  0+1  2+1  6+5]│  │  ← 一行快捷按钮
│  │                               │  │
│  │  目标名称  [___________]      │  │
│  │                               │  │
│  │  ┌─ 角色 ─┐  ┌─ 武器 ─┐      │  │  ← 子目标卡片
│  │  │ 0命    │  │ 1精    │      │  │
│  │  │ □大保底│  │ □大保底│      │  │
│  │  └────────┘  └────────┘      │  │
│  │                               │  │
│  │  卡池时间  [开始] ~ [结束]    │  │
│  │                               │  │
│  │  [      设定目标      ]       │  │  ← 主按钮，全宽
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎯 保底状态                    │  │
│  │ 当前抽数 [__]抽   大保底 [开关]│  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💎 我的资源                    │  │
│  │ 原石        [______]          │  │
│  │ 纠缠之缘    [______]          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📊 达成概率                    │  │
│  │                               │  │
│  │  当前目标: 胡桃 0+1            │  │  ← 目标标签
│  │                               │  │
│  │        78.5%                  │  │  ← 超大数字
│  │       达成概率                 │  │
│  │                               │  │
│  │  当前可抽: 120抽              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📈 概率分布          [展开 ▶] │  │  ← 默认折叠
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📅 攒抽预测          [展开 ▶] │  │  ← 默认折叠
│  │ 目标卡池: 2026-06-01~06-21    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📋 数据版本 v2.1.0             │  │  ← 弱化展示
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 详细设计规范

### 1. 页面背景
- 背景色: `#F5F3F0` (暖灰色，比纯白柔和，减少视觉疲劳)
- 页面内边距: `32rpx` 左右, `24rpx` 上下

### 2. 卡片容器（所有 section 共用）
```css
.section-card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
```

### 3. 目标卡片（强调样式）
```css
.target-card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #C4A77D;  /* 强调色边框 */
  box-shadow: 0 4rpx 16rpx rgba(196, 167, 125, 0.12);
}
```

### 4. Section 标题
```css
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C2520;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
/* 用 CSS 小圆点代替 emoji */
.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: #C4A77D;
  border-radius: 4rpx;
}
```

### 5. 快捷按钮行
```css
.preset-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}
.preset-btn {
  padding: 12rpx 24rpx;
  background: #F5F3F0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #2C2520;
  font-weight: 500;
  border: 2rpx solid transparent;
}
.preset-btn.active {
  background: #C4A77D;
  color: white;
}
```

### 6. 子目标卡片（角色 / 武器）
```css
.subtarget-grid {
  display: flex;
  gap: 20rpx;
}
.subtarget-card {
  flex: 1;
  background: #FAF9F7;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #E5E0D8;
}
.subtarget-type {
  font-size: 24rpx;
  color: #7A7168;
  margin-bottom: 16rpx;
}
.subtarget-rank {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.rank-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: white;
  border: 2rpx solid #E5E0D8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}
.rank-btn.active {
  background: #C4A77D;
  color: white;
  border-color: #C4A77D;
}
```

### 7. 输入框统一规范
```css
.form-input {
  height: 80rpx;
  padding: 0 24rpx;
  background: #F5F3F0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2C2520;
  border: 2rpx solid transparent;
}
.form-input:focus {
  border-color: #C4A77D;
  background: white;
}
```

### 8. 主按钮
```css
.btn-primary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #C4A77D;
  color: white;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(196, 167, 125, 0.3);
}
```

### 9. 概率展示区
```css
.probability-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}
.probability-number {
  font-size: 96rpx;
  font-weight: 800;
  color: #C4A77D;
  line-height: 1;
}
.probability-label {
  font-size: 28rpx;
  color: #7A7168;
  margin-top: 12rpx;
}
.target-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: #F5F3F0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #2C2520;
  margin-bottom: 16rpx;
}
```

### 10. 折叠 Section
```css
.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.toggle-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7A7168;
  font-size: 24rpx;
}
```

### 11. 版本信息（弱化）
```css
.version-section {
  background: transparent;
  padding: 16rpx 32rpx;
  text-align: center;
}
.version-text {
  font-size: 22rpx;
  color: #A8A095;
}
```

---

## 交互说明

### 快捷按钮
- 点击「0+1」：角色子目标设为 0 命，武器子目标设为 1 精
- 点击「6+5」：角色子目标设为 6 命，武器子目标设为 5 精
- 点击后按钮变为 active 状态（金色背景）
- 手动修改子目标后，快捷按钮自动取消 active

### 子目标等级选择
- 角色：0~6 共 7 个等级按钮横排，点击选中
- 武器：0~5 共 6 个等级按钮横排，点击选中
- 选中的等级按钮高亮（金色背景）

### 概率图表
- 默认折叠，只显示 section 标题和「展开」按钮
- 点击展开后显示概率图表
- 展开状态下再次点击收起

### 攒抽预测
- 默认折叠
- 折叠态显示目标卡池时间（只读）
- 展开后显示每日收入、其他获取、时间线
