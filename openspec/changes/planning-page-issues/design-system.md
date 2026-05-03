# 规划页面设计系统

## 字体层级

| 层级 | 用途 | 字号 | 字重 | 行高 | 颜色 |
|------|------|------|------|------|------|
| H1 | 页面标题（游戏名） | 44rpx | 800 | 1.2 | #2C2520 |
| H2 | 页面副标题 | 28rpx | 400 | 1.4 | #7A7168 |
| H3 | Section 标题 | 32rpx | 700 | 1.3 | #2C2520 |
| H4 | 卡片内标题 | 28rpx | 600 | 1.4 | #2C2520 |
| Body | 正文/输入文字 | 28rpx | 400 | 1.5 | #2C2520 |
| Label | 字段标签 | 26rpx | 500 | 1.4 | #7A7168 |
| Caption | 辅助说明 | 22rpx | 400 | 1.4 | #A8A095 |
| Number-L | 大数字（概率） | 96rpx | 800 | 1 | #C4A77D |
| Number-M | 中数字（指标） | 44rpx | 700 | 1 | #C4A77D |
| Number-S | 小数字 | 28rpx | 600 | 1 | #2C2520 |
| Tag | 标签文字 | 20rpx | 600 | 1 | white/#7A7168 |

## 颜色系统

### 品牌色
| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | #C4A77D | 主按钮、强调边框、概率数字、活跃状态 |
| Primary-Light | #F5F0E8 | 浅色背景、hover 状态 |
| Primary-Dark | #A88B5A | 按下状态、深色强调 |

### 功能色
| 名称 | 色值 | 用途 |
|------|------|------|
| Success | #7FB069 | 高概率、达成、成功提示 |
| Warning | #F5A623 | 中概率、警告提示 |
| Error | #C47070 | 低概率、错误、删除操作 |
| Info | #6B9BD0 | 信息提示、链接 |

### 中性色
| 名称 | 色值 | 用途 |
|------|------|------|
| Background | #F5F3F0 | 页面背景 |
| Card | #FFFFFF | 卡片背景 |
| Card-Alt | #FAF9F7 | 次级卡片背景 |
| Divider | #E5E0D8 | 分隔线、边框 |
| Text-Primary | #2C2520 | 主文字 |
| Text-Secondary | #7A7168 | 次要文字 |
| Text-Tertiary | #A8A095 | 辅助文字、禁用状态 |

## 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| space-xs | 8rpx | 图标与文字间距、紧凑内联间距 |
| space-sm | 12rpx | 小元素间距、标签内边距 |
| space-md | 16rpx | 按钮内边距、表单项间距 |
| space-lg | 24rpx | 卡片内元素间距、字段间距 |
| space-xl | 32rpx | 卡片内边距、section 间距 |
| space-2xl | 48rpx | 大区块间距 |

## 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| radius-sm | 8rpx | 标签、小按钮 |
| radius-md | 12rpx | 输入框、等级按钮 |
| radius-lg | 16rpx | 小卡片、按钮 |
| radius-xl | 20rpx | Section 卡片 |
| radius-full | 999rpx | 圆形元素 |

## 阴影系统

| Token | 值 | 用途 |
|-------|-----|------|
| shadow-sm | 0 2rpx 8rpx rgba(0,0,0,0.04) | 普通卡片 |
| shadow-md | 0 4rpx 16rpx rgba(0,0,0,0.06) | 悬浮卡片 |
| shadow-primary | 0 4rpx 16rpx rgba(196,167,125,0.15) | 目标卡片（强调） |
| shadow-btn | 0 4rpx 12rpx rgba(196,167,125,0.3) | 主按钮 |

## 组件规范

### Section 卡片
```css
.section-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
```

### 目标卡片（强调）
```css
.target-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #C4A77D;
  box-shadow: 0 4rpx 16rpx rgba(196,167,125,0.15);
}
```

### 目标 Chip（紧凑列表）
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
  font-weight: 600;
}
```

### 输入框
```css
.form-input {
  height: 80rpx;
  padding: 0 24rpx;
  background: #FAF9F7;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2C2520;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}
```

### 主按钮
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
  box-shadow: 0 4rpx 12rpx rgba(196,167,125,0.3);
}
.btn-primary:active {
  background: #A88B5A;
  transform: scale(0.98);
}
```

### 次级按钮
```css
.btn-secondary {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #FAF9F7;
  color: #2C2520;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  border: 2rpx solid #E5E0D8;
}
```

### 危险按钮
```css
.btn-danger {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #FAF9F7;
  color: #C47070;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  border: 2rpx solid #E5E0D8;
}
```

### 等级选择按钮
```css
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
  box-shadow: 0 2rpx 8rpx rgba(196,167,125,0.3);
}
```

### 指标卡片
```css
.metric-card {
  flex: 1;
  background: #FAF9F7;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}
.metric-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #C4A77D;
  line-height: 1.2;
}
.metric-label {
  font-size: 22rpx;
  color: #7A7168;
  margin-top: 8rpx;
  font-weight: 500;
}
```

### Section 标题（带装饰条）
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
.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: #C4A77D;
  border-radius: 4rpx;
}
```
