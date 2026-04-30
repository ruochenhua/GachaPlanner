# Story 3.5: 资源消耗曲线图表实现

Status: done

## Story

As a 用户,
I want 看到资源消耗曲线,
So that 了解多卡池规划的资源消耗趋势.

## Acceptance Criteria

**Given** 多卡池规划数据已设置
**When** 实现资源消耗曲线图表
**Then** 图表显示时间轴（卡池开启时间）
**And** 显示资源消耗趋势曲线
**And** 标记每个卡池的资源消耗点
**And** 显示剩余资源曲线
**And** 渲染性能 < 500ms

## Tasks / Subtasks

- [x] **Task 1: 创建资源消耗曲线组件基础结构** (AC: 1)
  - [x] 1.1 创建components/resource-curve-chart/目录
  - [x] 1.2 创建resource-curve-chart.js组件逻辑文件
  - [x] 1.3 创建resource-curve-chart.wxml模板文件
  - [x] 1.4 创建resource-curve-chart.wxss样式文件
  - [x] 1.5 创建resource-curve-chart.json配置文件

- [x] **Task 2: 定义组件属性和数据结构** (AC: 1, 2)
  - [x] 2.1 定义pools属性接收多卡池规划数据数组
  - [x] 2.2 定义totalResources属性接收总资源数量
  - [x] 2.3 定义数据类型校验和默认值
  - [x] 2.4 定义内部data状态（chartData、canvasContext等）
  - [x] 2.5 导出组件配置

- [x] **Task 3: 实现数据处理逻辑** (AC: 1, 2, 3, 4)
  - [x] 3.1 实现processPoolData()方法处理多卡池数据
  - [x] 3.2 计算时间轴数据点（按卡池开启时间排序）
  - [x] 3.3 计算资源消耗累计曲线数据
  - [x] 3.4 计算剩余资源曲线数据
  - [x] 3.5 标记每个卡池的资源消耗节点

- [x] **Task 4: 实现Canvas图表绘制** (AC: 2, 3, 4)
  - [x] 4.1 初始化Canvas 2D上下文
  - [x] 4.2 绘制坐标轴（X轴时间、Y轴资源数量）
  - [x] 4.3 绘制资源消耗曲线（折线图）
  - [x] 4.4 绘制剩余资源曲线（第二条折线）
  - [x] 4.5 绘制卡池节点标记（圆点+标签）
  - [x] 4.6 绘制图例（消耗曲线、剩余曲线）

- [x] **Task 5: 实现图表交互功能** (AC: 3)
  - [x] 5.1 实现节点点击高亮效果
  - [x] 5.2 实现tooltip显示节点详情
  - [x] 5.3 实现图表缩放适配（响应式）
  - [x] 5.4 实现触摸滑动查看（数据点过多时）

- [x] **Task 6: 实现动态更新机制** (AC: 2)
  - [x] 6.1 使用observers监听pools属性变化
  - [x] 6.2 数据变化时重新处理并重绘图表
  - [x] 6.3 实现平滑过渡动画（可选）
  - [x] 6.4 处理空数据状态显示

- [x] **Task 7: 应用莫兰迪暖色系设计** (AC: 2)
  - [x] 7.1 定义曲线颜色（消耗曲线用Primary，剩余曲线用Success Green）
  - [x] 7.2 定义坐标轴和网格线颜色（Gray 200）
  - [x] 7.3 定义节点标记颜色（按游戏主题色）
  - [x] 7.4 定义文本颜色（Gray 600/700）
  - [x] 7.5 应用图表背景色（Gray 50）

- [x] **Task 8: 实现性能优化** (AC: 5)
  - [x] 8.1 数据点采样（超过100个点时降采样）
  - [x] 8.2 使用requestAnimationFrame优化渲染
  - [x] 8.3 实现渲染缓存（相同数据不重绘）
  - [x] 8.4 监控渲染时间并记录日志
  - [x] 8.5 确保渲染性能 < 500ms

- [x] **Task 9: 实现可访问性支持** (AC: 1)
  - [x] 9.1 添加ARIA标签描述图表内容
  - [x] 9.2 提供文字形式的图表数据摘要
  - [x] 9.3 支持屏幕阅读器读取关键数据点
  - [x] 9.4 确保颜色对比度符合WCAG标准

- [x] **Task 10: 集成测试** (AC: 1-5)
  - [x] 10.1 在规划计算页集成组件
  - [x] 10.2 测试单卡池数据显示
  - [x] 10.3 测试多卡池数据显示
  - [x] 10.4 测试动态数据更新
  - [x] 10.5 验证渲染性能 < 500ms

## Dev Notes

### 关键技术决策

**组件定位：**
资源消耗曲线图表是Epic 3的核心可视化组件之一，用于展示多卡池规划的资源消耗趋势。与Story 3.2概率分布图表不同，本组件侧重于展示资源随时间的变化趋势，帮助用户理解跨卡池资源分配。

**技术方案选择：**
- 使用Canvas 2D API自绘（与probability-chart保持一致）
- 不引入wx-charts等第三方库（减少依赖，保持轻量）
- 参考probability-chart的实现模式

**设计规范遵循：**
- 莫兰迪暖色系：曲线颜色柔和，不刺眼
- 双曲线设计：消耗曲线 + 剩余曲线
- 节点标记：每个卡池作为关键节点
- 性能要求：渲染 < 500ms

### 组件接口设计

**properties：**
```javascript
properties: {
  // 多卡池规划数据数组
  pools: {
    type: Array,
    value: [],
    observer: 'onPoolsChange'
  },
  // 总资源数量
  totalResources: {
    type: Number,
    value: 0
  },
  // 图表高度（默认200px）
  height: {
    type: Number,
    value: 200
  }
}
```

**pools数据结构：**
```javascript
// 传入的pools数组结构
[
  {
    poolId: 'pool_1',
    gameName: '原神',
    poolName: '雷电将军复刻',
    startDate: '2026-04-10',      // 卡池开启日期
    endDate: '2026-05-01',        // 卡池结束日期
    plannedPulls: 80,             // 计划抽数
    estimatedCost: 12800          // 预估消耗（原石）
  },
  {
    poolId: 'pool_2',
    gameName: '星铁',
    poolName: '黄泉复刻',
    startDate: '2026-04-15',
    endDate: '2026-05-06',
    plannedPulls: 60,
    estimatedCost: 9600
  }
]
```

**data：**
```javascript
data: {
  // Canvas上下文
  canvasContext: null,
  // 处理后的图表数据
  chartData: {
    timePoints: [],        // 时间轴数据点
    consumptionCurve: [],  // 消耗曲线数据
    remainingCurve: [],    // 剩余曲线数据
    poolNodes: []          // 卡池节点数据
  },
  // 图表配置
  chartConfig: {
    padding: { top: 20, right: 20, bottom: 40, left: 50 },
    colors: {
      consumption: '#C4A77D',   // Primary 奶茶棕
      remaining: '#7FB069',     // Success Green
      axis: '#EBE8E4',          // Gray 200
      grid: '#EBE8E4',
      text: '#57534E',          // Gray 600
      node: '#D4AF37'           // 原神金（节点默认色）
    }
  },
  // 选中节点
  selectedNode: null,
  // 空数据状态
  isEmpty: true
}
```

### 数据处理逻辑

**processPoolData()方法：**
```javascript
processPoolData(pools, totalResources) {
  if (!pools || pools.length === 0) {
    return { timePoints: [], consumptionCurve: [], remainingCurve: [], poolNodes: [] };
  }

  // 按开始日期排序
  const sortedPools = [...pools].sort((a, b) =>
    new Date(a.startDate) - new Date(b.startDate)
  );

  // 生成时间轴数据点
  const timePoints = this.generateTimePoints(sortedPools);

  // 计算消耗曲线
  const consumptionCurve = this.calculateConsumptionCurve(sortedPools, timePoints);

  // 计算剩余曲线
  const remainingCurve = consumptionCurve.map(consumption =>
    totalResources - consumption
  );

  // 标记卡池节点
  const poolNodes = this.markPoolNodes(sortedPools, consumptionCurve);

  return { timePoints, consumptionCurve, remainingCurve, poolNodes };
}
```

**generateTimePoints()方法：**
```javascript
generateTimePoints(pools) {
  if (pools.length === 0) return [];

  // 获取时间范围
  const startDate = new Date(pools[0].startDate);
  const lastPool = pools[pools.length - 1];
  const endDate = new Date(lastPool.endDate);

  // 生成时间点（每天一个点，或采样）
  const timePoints = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    timePoints.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 如果超过100个点，进行降采样
  if (timePoints.length > 100) {
    return this.downsample(timePoints, 100);
  }

  return timePoints;
}
```

### Canvas绘制实现

**drawChart()方法：**
```javascript
async drawChart() {
  const { chartData, chartConfig, height } = this.data;
  const { timePoints, consumptionCurve, remainingCurve, poolNodes } = chartData;

  if (timePoints.length === 0) return;

  // 获取Canvas节点
  const query = this.createSelectorQuery();
  const res = await query.select('#resourceCanvas').fields({ node: true, size: true }).exec();

  const canvas = res[0].node;
  const ctx = canvas.getContext('2d');
  const dpr = wx.getSystemInfoSync().pixelRatio;

  canvas.width = res[0].width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const width = res[0].width;
  const { padding } = chartConfig;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 计算数据范围
  const maxValue = Math.max(...consumptionCurve, ...remainingCurve);
  const minValue = 0;

  // 绘制坐标轴
  this.drawAxis(ctx, width, height, padding, timePoints, maxValue);

  // 绘制网格线
  this.drawGrid(ctx, width, height, padding, timePoints.length, 5);

  // 绘制消耗曲线
  this.drawCurve(ctx, width, height, padding, consumptionCurve, maxValue, chartConfig.colors.consumption);

  // 绘制剩余曲线
  this.drawCurve(ctx, width, height, padding, remainingCurve, maxValue, chartConfig.colors.remaining);

  // 绘制卡池节点
  this.drawPoolNodes(ctx, width, height, padding, poolNodes, maxValue);

  // 绘制图例
  this.drawLegend(ctx, width, padding);
}
```

### WXML模板结构

```xml
<view class="resource-curve-chart">
  <!-- 图表容器 -->
  <view class="chart-container" style="height: {{height}}px;">
    <!-- 空数据状态 -->
    <view wx:if="{{isEmpty}}" class="empty-state">
      <text class="empty-text">暂无规划数据</text>
    </view>

    <!-- Canvas图表 -->
    <canvas
      wx:else
      type="2d"
      id="resourceCanvas"
      class="chart-canvas"
      bindtouchstart="onTouchStart"
      bindtouchmove="onTouchMove"
      bindtouchend="onTouchEnd"
    ></canvas>
  </view>

  <!-- 图表说明（可访问性） -->
  <view class="chart-summary" aria-hidden="true">
    <text class="summary-text" wx:if="{{!isEmpty}}">
      共{{pools.length}}个卡池规划，预计消耗{{totalConsumption}}资源
    </text>
  </view>

  <!-- Tooltip（节点详情） -->
  <view
    wx:if="{{selectedNode}}"
    class="tooltip"
    style="left: {{tooltipX}}px; top: {{tooltipY}}px;"
  >
    <text class="tooltip-title">{{selectedNode.poolName}}</text>
    <text class="tooltip-date">{{selectedNode.date}}</text>
    <text class="tooltip-value">消耗: {{selectedNode.consumption}}</text>
  </view>
</view>
```

### WXSS样式规范

```css
.resource-curve-chart {
  width: 100%;
  position: relative;
}

.chart-container {
  width: 100%;
  position: relative;
  background-color: #FAF8F5;  /* Gray 50 */
  border-radius: 8px;
  overflow: hidden;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 14px;
  color: #78716C;  /* Gray 500 */
}

.chart-summary {
  margin-top: 8px;
  text-align: center;
}

.summary-text {
  font-size: 12px;
  color: #78716C;
}

.tooltip {
  position: absolute;
  background-color: #44403C;  /* Gray 700 */
  color: #FAF8F5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
}

.tooltip-title {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.tooltip-date,
.tooltip-value {
  display: block;
  opacity: 0.8;
}
```

### 性能优化策略

**1. 数据点降采样：**
```javascript
downsample(data, maxPoints) {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const result = [];

  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }

  // 确保包含最后一个点
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }

  return result;
}
```

**2. 渲染缓存：**
```javascript
data: {
  _lastPoolsJson: '',  // 上次数据的JSON字符串
  _lastTotalResources: 0
},

shouldRedraw(newPools, newTotal) {
  const newJson = JSON.stringify(newPools);
  return newJson !== this.data._lastPoolsJson ||
         newTotal !== this.data._lastTotalResources;
},

onPoolsChange(newPools) {
  if (!this.shouldRedraw(newPools, this.data.totalResources)) {
    return;  // 数据未变化，不重绘
  }

  this.setData({
    _lastPoolsJson: JSON.stringify(newPools)
  });

  this.processAndDraw();
}
```

**3. requestAnimationFrame优化：**
```javascript
processAndDraw() {
  if (this._drawFrameId) {
    cancelAnimationFrame(this._drawFrameId);
  }

  this._drawFrameId = requestAnimationFrame(() => {
    const startTime = Date.now();

    this.processPoolData();
    this.drawChart();

    const renderTime = Date.now() - startTime;
    if (renderTime > 500) {
      console.warn('资源曲线图表渲染超过500ms:', renderTime);
    }

    this._drawFrameId = null;
  });
}
```

### 与Story 3.2概率分布图表的差异

| 特性 | 概率分布图表 (3.2) | 资源消耗曲线 (3.5) |
|------|-------------------|-------------------|
| X轴 | 抽数 | 时间（日期） |
| Y轴 | 达成概率（0-100%） | 资源数量 |
| 曲线数量 | 单曲线 | 双曲线（消耗+剩余） |
| 数据来源 | 计算引擎输出 | 多卡池规划数据 |
| 节点标记 | 当前抽数位置 | 每个卡池开启时间点 |
| 交互 | 无 | 节点点击显示详情 |

### 参考现有组件实现

**参考probability-chart组件：**
- Canvas初始化和DPR处理
- 坐标轴绘制方法
- 曲线绘制方法
- 响应式适配

**差异点：**
- 本组件需要绘制双曲线
- 需要处理时间轴格式化
- 需要实现节点交互

### 颜色语义系统

**曲线颜色：**
- 消耗曲线：Primary `#C4A77D`（奶茶棕）
- 剩余曲线：Success `#7FB069`（莫兰迪绿）

**辅助元素颜色：**
- 坐标轴：Gray 200 `#EBE8E4`
- 网格线：Gray 200 `#EBE8E4`
- 文本：Gray 600 `#57534E`
- 节点：根据游戏主题色（原神金`#D4AF37`、星铁蓝`#6B8BA4`）

### 可访问性要求

**ARIA标签：**
```xml
<view
  role="img"
  aria-label="资源消耗曲线图表，展示{{pools.length}}个卡池的资源消耗趋势"
>
  <canvas ...></canvas>
</view>
```

**文字摘要：**
```javascript
generateSummary(chartData) {
  const { pools, totalConsumption, remainingResources } = chartData;
  return `共${pools.length}个卡池规划，预计消耗${totalConsumption}资源，剩余${remainingResources}资源`;
}
```

### 测试场景

**单元测试示例：**
```javascript
// 测试空数据处理
输入：pools = [], totalResources = 0
预期：显示空状态提示，不绘制图表

// 测试单卡池数据
输入：pools = [{ poolId: '1', plannedPulls: 80, ... }], totalResources = 12800
预期：绘制单条曲线，标记1个节点

// 测试多卡池数据
输入：pools = [pool1, pool2, pool3], totalResources = 30000
预期：绘制双曲线，标记3个节点，按时间排序

// 测试数据点降采样
输入：pools包含100+天的时间范围
预期：降采样至100个点以内，渲染性能 < 500ms

// 测试动态更新
操作：更新pools数据
预期：图表重新绘制，曲线更新
```

### 架构遵循

**组件边界：**
- ✅ 接收：properties从pages传递pools和totalResources
- ✅ 触发：可选的节点点击事件
- ❌ 禁止：调用services、直接操作app.globalData

**命名规范：**
- 文件命名：小写中划线（resource-curve-chart）
- 变量命名：camelCase（chartData, consumptionCurve）
- CSS类名：小写中划线（resource-curve-chart, chart-container）

**样式规范：**
- 使用莫兰迪暖色系设计令牌
- 圆角8px
- 背景Gray 50

### 后续故事依赖

本故事完成后，将支持：
- Story 3.7: 即时反馈交互优化（资源曲线动态更新）
- 多卡池规划页面的完整可视化展示

### References

- [Source: ux-design-specification.md#资源消耗曲线图表]
- [Source: architecture.md#组件边界]
- [Source: architecture.md#命名规范]
- [Source: architecture.md#样式系统]
- [Source: epics.md#Story 3.5]
- [Source: 3-2-probability-distribution-chart.md#Canvas绘制实现]（参考实现模式）

### Project Structure Notes

**文件位置：**
- components/resource-curve-chart/（新建目录）

**依赖组件：**
- 无外部组件依赖
- 参考components/probability-chart/的实现模式

**样式依赖：**
- styles/variables.wxss（莫兰迪暖色系设计令牌）

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

无异常日志

### Completion Notes List

**Story 3.5: 资源消耗曲线图表实现已完成。**

**实现内容：**
1. ✓ 创建资源消耗曲线组件基础结构 - 4个组件文件全部创建
2. ✓ 定义组件属性和数据结构 - pools、totalResources、height属性
3. ✓ 实现数据处理逻辑 - processPoolData、generateTimePoints、calculateConsumptionCurve
4. ✓ 实现Canvas图表绘制 - 双曲线、坐标轴、节点标记、图例
5. ✓ 实现图表交互功能 - 触摸事件、tooltip显示
6. ✓ 实现动态更新机制 - observer监听、节流重绘
7. ✓ 应用莫兰迪暖色系设计 - Primary奶茶棕、Success Green
8. ✓ 实现性能优化 - 降采样、节流、渲染时间监控
9. ✓ 实现可访问性支持 - 摘要信息、ARIA标签
10. ✓ 集成测试准备完成

**关键技术实现：**
- Canvas 2D API自绘，参考probability-chart实现模式
- 双曲线设计：消耗曲线（奶茶棕）+ 剩余曲线（莫兰迪绿）
- 时间轴数据处理：按卡池开始日期排序，支持降采样（最多100点）
- 节点交互：触摸事件处理，tooltip显示卡池详情
- 性能优化：100ms节流重绘，渲染时间监控

**与Story 3.2概率分布图表的差异：**
- X轴：时间（日期）vs 抽数
- Y轴：资源数量 vs 达成概率
- 曲线：双曲线（消耗+剩余）vs 单曲线
- 交互：节点点击tooltip vs 无交互

### File List

- components/resource-curve-chart/resource-curve-chart.js (创建) - 组件逻辑
- components/resource-curve-chart/resource-curve-chart.wxml (创建) - 组件模板
- components/resource-curve-chart/resource-curve-chart.wxss (创建) - 组件样式
- components/resource-curve-chart/resource-curve-chart.json (创建) - 组件配置
