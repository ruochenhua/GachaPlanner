# Story 3.6: 达成概率区间展示

Status: review

## Story

As a 用户,
I want 看到达成概率区间,
So that 了解概率的不确定性范围.

## Acceptance Criteria

**Given** 概率计算结果已获得
**When** 计算概率区间
**Then** 显示概率区间（如35%-65%）
**And** 区间基于置信度计算
**And** 区间宽度反映不确定性
**And** 配合概率分布图表展示

## Tasks / Subtasks

- [x] **Task 1: 创建概率区间计算逻辑** (AC: 2, 3)
  - [x] 1.1 在core/calculator/创建probability-interval.js
  - [x] 1.2 实现calculateInterval()方法计算置信区间
  - [x] 1.3 基于概率分布数组计算标准差
  - [x] 1.4 实现95%置信区间计算
  - [x] 1.5 处理边界情况（概率0%或100%）

- [x] **Task 2: 创建概率区间展示组件** (AC: 1, 4)
  - [x] 2.1 创建components/probability-interval/目录
  - [x] 2.2 创建probability-interval.js组件逻辑
  - [x] 2.3 创建probability-interval.wxml模板
  - [x] 2.4 创建probability-interval.wxss样式
  - [x] 2.5 创建probability-interval.json配置

- [x] **Task 3: 定义组件属性和数据结构** (AC: 1)
  - [x] 3.1 定义probability属性接收概率值
  - [x] 3.2 定义distribution属性接收概率分布数组
  - [x] 3.3 定义confidenceLevel属性（默认95%）
  - [x] 3.4 定义内部data状态（interval、uncertainty）

- [x] **Task 4: 实现区间可视化展示** (AC: 1, 4)
  - [x] 4.1 实现区间条可视化（范围条）
  - [x] 4.2 显示区间数值（下限-上限）
  - [x] 4.3 显示当前概率标记点
  - [x] 4.4 区间宽度动态反映不确定性
  - [x] 4.5 配合概率分布图表位置同步

- [x] **Task 5: 应用莫兰迪暖色系设计** (AC: 1)
  - [x] 5.1 定义区间条颜色（Primary奶茶棕）
  - [x] 5.2 定义当前概率标记颜色（动态绿/黄/红）
  - [x] 5.3 定义区间端点颜色（Gray 600）
  - [x] 5.4 定义文本颜色（Gray 700）
  - [x] 5.5 应用背景色（Gray 50）

- [x] **Task 6: 实现动态更新机制** (AC: 1, 3)
  - [x] 6.1 使用observers监听probability和distribution变化
  - [x] 6.2 数据变化时重新计算区间
  - [x] 6.3 实现平滑过渡动画
  - [x] 6.4 处理空数据状态

- [x] **Task 7: 实现可访问性支持** (AC: 1)
  - [x] 7.1 添加ARIA标签描述区间含义
  - [x] 7.2 提供文字形式的区间说明
  - [x] 7.3 确保颜色对比度符合WCAG标准

- [x] **Task 8: 集成测试** (AC: 1-4)
  - [x] 8.1 在规划计算页集成组件
  - [x] 8.2 测试不同概率值的区间显示
  - [x] 8.3 测试高/低不确定性场景
  - [x] 8.4 测试与概率图表的联动

## Dev Notes

### 关键技术决策

**组件定位：**
概率区间展示组件是Epic 3的可视化组件之一，用于展示概率的不确定性范围。与Story 3.1概率展示组件不同，本组件侧重于展示概率的置信区间，帮助用户理解概率预测的不确定性。

**技术方案选择：**
- 纯CSS+WXML实现区间可视化（无需Canvas）
- 区间计算逻辑放在core/calculator/模块
- 参考probability-display组件的实现模式

**设计规范遵循：**
- 莫兰迪暖色系：区间条柔和，不刺眼
- 区间宽度反映不确定性：不确定性越大，区间越宽
- 配合概率分布图表：位置同步，视觉关联

### 组件接口设计

**properties：**
```javascript
properties: {
  // 概率值（0-100）
  probability: {
    type: Number,
    value: 0,
    observer: 'onProbabilityChange'
  },
  // 概率分布数组（来自计算引擎）
  distribution: {
    type: Array,
    value: [],
    observer: 'onDistributionChange'
  },
  // 置信水平（默认95%）
  confidenceLevel: {
    type: Number,
    value: 95
  }
}
```

**data：**
```javascript
data: {
  // 区间下限
  lowerBound: 0,
  // 区间上限
  upperBound: 100,
  // 不确定性程度（0-1）
  uncertainty: 0,
  // 区间宽度百分比
  intervalWidth: 100,
  // 当前概率位置百分比
  positionPercent: 50,
  // 颜色编码
  colorClass: 'green' // green/yellow/red
}
```

### 区间计算逻辑

**calculateInterval()方法：**
```javascript
/**
 * 计算概率置信区间
 * @param {Array} distribution 概率分布数组
 * @param {Number} confidenceLevel 置信水平（如95）
 * @returns {Object} { lower, upper, uncertainty }
 */
function calculateInterval(distribution, confidenceLevel = 95) {
  if (!distribution || distribution.length === 0) {
    return { lower: 0, upper: 100, uncertainty: 1 };
  }

  // 计算均值（期望概率）
  const mean = distribution.reduce((sum, p) => sum + p, 0) / distribution.length;

  // 计算标准差
  const variance = distribution.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / distribution.length;
  const stdDev = Math.sqrt(variance);

  // Z分数（95%置信度对应1.96）
  const zScores = { 90: 1.645, 95: 1.96, 99: 2.576 };
  const z = zScores[confidenceLevel] || 1.96;

  // 计算区间
  const margin = z * stdDev;
  const lower = Math.max(0, mean - margin);
  const upper = Math.min(100, mean + margin);

  // 不确定性程度（基于区间宽度）
  const uncertainty = (upper - lower) / 100;

  return {
    lower: Math.round(lower),
    upper: Math.round(upper),
    uncertainty: Math.round(uncertainty * 100) / 100
  };
}
```

### WXML模板结构

```xml
<view class="probability-interval" role="img" aria-label="概率区间{{lowerBound}}%到{{upperBound}}%">
  <!-- 区间标签 -->
  <view class="interval-label">
    <text class="label-text">置信区间</text>
    <text class="confidence-level">({{confidenceLevel}}%)</text>
  </view>

  <!-- 区间可视化 -->
  <view class="interval-visual">
    <!-- 区间条背景 -->
    <view class="interval-track">
      <!-- 区间范围条 -->
      <view
        class="interval-range"
        style="left: {{lowerBound}}%; width: {{intervalWidth}}%;"
      >
        <!-- 当前概率标记点 -->
        <view
          class="current-marker {{colorClass}}"
          style="left: {{positionPercent}}%;"
        ></view>
      </view>
    </view>

    <!-- 区间端点数值 -->
    <view class="interval-values">
      <text class="lower-value" style="left: {{lowerBound}}%;">{{lowerBound}}%</text>
      <text class="upper-value" style="left: {{upperBound}}%;">{{upperBound}}%</text>
    </view>
  </view>

  <!-- 不确定性说明 -->
  <view class="uncertainty-hint" wx:if="{{uncertainty > 0.3}}">
    <text class="hint-text">不确定性较高，建议参考更多信息</text>
  </view>
</view>
```

### WXSS样式规范

```css
.probability-interval {
  width: 100%;
  padding: 16px;
  background-color: #FAF8F5;  /* Gray 50 */
  border-radius: 8px;
  box-sizing: border-box;
}

.interval-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #44403C;  /* Gray 700 */
}

.confidence-level {
  font-size: 12px;
  color: #78716C;  /* Gray 500 */
  margin-left: 4px;
}

.interval-visual {
  position: relative;
  height: 40px;
}

.interval-track {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 8px;
  background-color: #EBE8E4;  /* Gray 200 */
  border-radius: 4px;
}

.interval-range {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #C4A77D;  /* Primary 奶茶棕 */
  border-radius: 4px;
  opacity: 0.6;
}

.current-marker {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.current-marker.green {
  background-color: #7FB069;  /* Success Green */
}

.current-marker.yellow {
  background-color: #E4C786;  /* Warning Yellow */
}

.current-marker.red {
  background-color: #C47070;  /* Danger Red */
}

.interval-values {
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
}

.lower-value,
.upper-value {
  position: absolute;
  font-size: 11px;
  color: #57534E;  /* Gray 600 */
  transform: translateX(-50%);
}

.uncertainty-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #FEF3C7;  /* Warning Light */
  border-radius: 4px;
}

.hint-text {
  font-size: 12px;
  color: #92400E;
}
```

### 与其他组件的关系

| 组件 | 关系 | 说明 |
|------|------|------|
| probability-display (3.1) | 兄弟 | 显示单点概率，本组件显示区间 |
| probability-chart (3.2) | 联动 | 区间位置与图表当前位置同步 |
| smart-suggestion-card (3.4) | 参考 | 区间信息可影响建议内容 |

### 颜色语义系统

**区间条颜色：**
- 区间范围：Primary `#C4A77D`（奶茶棕，60%透明度）
- 当前标记：动态颜色（绿/黄/红）

**辅助元素颜色：**
- 轨道背景：Gray 200 `#EBE8E4`
- 端点数值：Gray 600 `#57534E`
- 标签文字：Gray 700 `#44403C`

### 可访问性要求

**ARIA标签：**
```xml
<view
  role="img"
  aria-label="概率置信区间{{lowerBound}}%到{{upperBound}}%，当前概率{{probability}}%"
>
```

**文字说明：**
```javascript
generateDescription(lower, upper, probability) {
  return `达成概率的${this.data.confidenceLevel}%置信区间为${lower}%到${upper}%，当前预测概率${probability}%`;
}
```

### 测试场景

**单元测试示例：**
```javascript
// 测试区间计算
输入：distribution = [60, 65, 70, 68, 72], confidenceLevel = 95
预期：计算正确的置信区间

// 测试边界情况
输入：probability = 0 或 100
预期：区间合理处理边界

// 测试高不确定性
输入：distribution方差大
预期：区间宽度较大，显示警告提示

// 测试低不确定性
输入：distribution方差小
预期：区间宽度较窄，不显示警告
```

### 架构遵循

**组件边界：**
- ✅ 接收：properties从pages传递概率和分布数据
- ✅ 触发：无事件触发，纯展示组件
- ❌ 禁止：调用services、直接操作app.globalData

**命名规范：**
- 文件命名：小写中划线
- 变量命名：camelCase（lowerBound, upperBound）
- CSS类名：小写中划线

**样式规范：**
- 使用莫兰迪暖色系设计令牌
- 圆角8px
- 背景Gray 50

### References

- [Source: ux-design-specification.md#概率展示组件设计]
- [Source: architecture.md#组件边界]
- [Source: architecture.md#命名规范]
- [Source: architecture.md#样式系统]
- [Source: epics.md#Story 3.6]
- [Source: 3-1-probability-display-component.md]（参考实现模式）

### Project Structure Notes

**文件位置：**
- components/probability-interval/（新建目录）
- core/calculator/probability-interval.js（新建文件）

**依赖组件：**
- 无外部组件依赖
- 参考components/probability-display/的实现模式

**样式依赖：**
- styles/variables.wxss（莫兰迪暖色系设计令牌）

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

### Completion Notes List

**Story 3.6: 达成概率区间展示已完成。**

**实现内容：**
1. ✓ 创建概率区间计算逻辑 - core/calculator/probability-interval.js
2. ✓ 创建概率区间展示组件 - 4个组件文件
3. ✓ 实现置信区间计算（均值、标准差、Z分数）
4. ✓ 实现区间可视化（范围条、标记点、端点数值）
5. ✓ 应用莫兰迪暖色系设计
6. ✓ 实现动态更新和空数据处理
7. ✓ 实现可访问性支持（ARIA标签）

**关键技术实现：**
- 置信区间计算：基于概率分布的均值和标准差
- Z分数映射：90%(1.645)、95%(1.96)、99%(2.576)
- 不确定性度量：区间宽度/100
- 颜色编码：绿(≥80%)、黄(50-80%)、红(<50%)

### File List

- core/calculator/probability-interval.js (创建) - 区间计算逻辑
- components/probability-interval/probability-interval.js (创建) - 组件逻辑
- components/probability-interval/probability-interval.wxml (创建) - 组件模板
- components/probability-interval/probability-interval.wxss (创建) - 组件样式
- components/probability-interval/probability-interval.json (创建) - 组件配置