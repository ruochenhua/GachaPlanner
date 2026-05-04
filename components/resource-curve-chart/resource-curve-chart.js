// components/resource-curve-chart/resource-curve-chart.js
// 资源消耗曲线图表组件

const MAX_CHART_POINTS = 100;
const DRAW_THROTTLE_MS = 100;

const themeService = require('../../services/theme-service');

const CHART_COLORS = {
  light: {
    consumption: '#C4A77D',
    remaining: '#7FB069',
    axis: '#EBE8E4',
    grid: '#EBE8E4',
    text: '#57534E',
    node: '#D4AF37',
    labelBg: '#FFFFFF'
  },
  dark: {
    consumption: '#D4BC99',
    remaining: '#8BC476',
    axis: '#3E3833',
    grid: '#3E3833',
    text: '#D4CFC6',
    node: '#E8C86A',
    labelBg: '#292524'
  }
};

Component({
  /**
   * 组件属性
   */
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
      value: 0,
      observer: 'onTotalResourcesChange'
    },
    // 图表高度（默认200px）
    height: {
      type: Number,
      value: 200
    }
  },

  /**
   * 组件数据
   */
  data: {
    canvasWidth: 0,
    canvasHeight: 200,
    chartMargin: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 40
    },
    // 图表配置
    chartConfig: {
      colors: {
        get consumption() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).consumption; },
        get remaining() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).remaining; },
        get axis() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).axis; },
        get grid() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).grid; },
        get text() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).text; },
        get node() { return (CHART_COLORS[themeService.resolve()] || CHART_COLORS.light).node; }
      }
    },
    // 处理后的图表数据
    chartData: {
      timePoints: [],        // 时间轴数据点
      consumptionCurve: [],  // 消耗曲线数据
      remainingCurve: [],    // 剩余曲线数据
      poolNodes: []          // 卡池节点数据
    },
    // 选中节点
    selectedNode: null,
    tooltipX: 0,
    tooltipY: 0,
    // 空数据状态
    isEmpty: true,
    // 摘要信息
    summary: '',
    totalConsumption: 0
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.setData({ canvasHeight: this.data.height });
      this.initCanvas();
      this._themeCb = (theme) => {
        if (this.ctx) {
          this.scheduleRedraw();
        }
      };
      themeService.onChange(this._themeCb);
    },
    detached() {
      if (this._drawThrottleTimer) {
        clearTimeout(this._drawThrottleTimer);
        this._drawThrottleTimer = null;
      }
      themeService.offChange(this._themeCb);
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 初始化Canvas
     */
    initCanvas() {
      const query = this.createSelectorQuery();
      query
        .select('#resourceCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          const dpr = wx.getSystemInfoSync().pixelRatio;

          canvas.width = res[0].width * dpr;
          canvas.height = this.data.canvasHeight * dpr;

          ctx.scale(dpr, dpr);

          this.canvas = canvas;
          this.ctx = ctx;

          const pending = this._pendingRedraw;
          this._pendingRedraw = false;

          this.setData(
            {
              canvasWidth: res[0].width
            },
            () => {
              const pools = this.data.pools || [];
              if (pending || pools.length > 0) {
                this.processAndDraw();
              }
            }
          );
        });
    },

    /**
     * pools变化监听器
     */
    onPoolsChange(newVal, oldVal) {
      if (!this.ctx) {
        this._pendingRedraw = true;
        return;
      }
      this.scheduleRedraw();
    },

    /**
     * totalResources变化监听器
     */
    onTotalResourcesChange(newVal, oldVal) {
      if (!this.ctx) {
        this._pendingRedraw = true;
        return;
      }
      const pools = this.data.pools || [];
      if (pools.length === 0) {
        return;
      }
      this.scheduleRedraw();
    },

    scheduleRedraw() {
      if (this._drawThrottleTimer) {
        clearTimeout(this._drawThrottleTimer);
      }
      this._drawThrottleTimer = setTimeout(() => {
        this._drawThrottleTimer = null;
        this.processAndDraw();
      }, DRAW_THROTTLE_MS);
    },

    /**
     * 处理数据并绘制图表
     */
    processAndDraw() {
      if (!this.ctx) {
        return;
      }

      const startTime = Date.now();

      const pools = this.data.pools || [];
      const totalResources = this.data.totalResources || 0;

      // 处理数据
      const chartData = this.processPoolData(pools, totalResources);

      // 更新数据并重绘
      this.setData({
        chartData,
        isEmpty: pools.length === 0,
        totalConsumption: chartData.totalConsumption || 0,
        summary: this.generateSummary(pools, chartData.totalConsumption || 0, totalResources)
      });

      this.redrawNow(chartData);

      const renderTime = Date.now() - startTime;
      if (renderTime > 500) {
        console.warn('资源曲线图表渲染超过500ms:', renderTime);
      }
    },

    /**
     * 处理多卡池数据
     */
    processPoolData(pools, totalResources) {
      if (!pools || pools.length === 0) {
        return {
          timePoints: [],
          consumptionCurve: [],
          remainingCurve: [],
          poolNodes: [],
          totalConsumption: 0
        };
      }

      // 验证并过滤有效卡池数据
      const validPools = pools.filter(pool =>
        pool && pool.poolId && pool.startDate && pool.endDate &&
        typeof pool.estimatedCost === 'number'
      );

      if (validPools.length === 0) {
        return {
          timePoints: [],
          consumptionCurve: [],
          remainingCurve: [],
          poolNodes: [],
          totalConsumption: 0
        };
      }

      // 按开始日期排序
      const sortedPools = [...validPools].sort((a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
      );

      // 生成时间轴数据点
      const { timePoints, poolStartIndices } = this.generateTimePoints(sortedPools);

      // 计算消耗曲线
      const consumptionCurve = this.calculateConsumptionCurve(sortedPools, timePoints);

      // 计算剩余曲线
      const remainingCurve = consumptionCurve.map(consumption =>
        Math.max(0, totalResources - consumption)
      );

      // 标记卡池节点
      const poolNodes = this.markPoolNodes(sortedPools, timePoints, consumptionCurve, poolStartIndices);

      // 计算总消耗
      const totalConsumption = consumptionCurve[consumptionCurve.length - 1] || 0;

      return { timePoints, consumptionCurve, remainingCurve, poolNodes, totalConsumption };
    },

    /**
     * 生成时间轴数据点
     */
    generateTimePoints(pools) {
      if (pools.length === 0) return { timePoints: [], poolStartIndices: [] };

      // 获取时间范围
      const startDate = new Date(pools[0].startDate);
      const lastPool = pools[pools.length - 1];
      const endDate = new Date(lastPool.endDate);

      // 生成时间点（每天一个点）
      const timePoints = [];
      const poolStartIndices = [];
      const current = new Date(startDate);

      // 记录每个卡池开始时间点的索引
      pools.forEach(pool => {
        const poolStart = new Date(pool.startDate);
        poolStartIndices.push({
          poolId: pool.poolId,
          startIndex: -1 // 稍后填充
        });
      });

      let dayIndex = 0;
      while (current <= endDate) {
        timePoints.push(new Date(current));

        // 检查是否有卡池在这一天开始
        pools.forEach((pool, poolIndex) => {
          const poolStart = new Date(pool.startDate);
          if (this.isSameDay(current, poolStart) && poolStartIndices[poolIndex].startIndex === -1) {
            poolStartIndices[poolIndex].startIndex = dayIndex;
          }
        });

        current.setDate(current.getDate() + 1);
        dayIndex++;
      }

      // 如果超过100个点，进行降采样
      if (timePoints.length > MAX_CHART_POINTS) {
        const sampled = this.downsample(timePoints, MAX_CHART_POINTS);
        // 更新poolStartIndices以匹配采样后的索引
        const newPoolStartIndices = poolStartIndices.map(item => ({
          poolId: item.poolId,
          startIndex: Math.round(item.startIndex * (sampled.length - 1) / (timePoints.length - 1))
        }));
        return { timePoints: sampled, poolStartIndices: newPoolStartIndices };
      }

      return { timePoints, poolStartIndices };
    },

    /**
     * 判断是否同一天
     */
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },

    /**
     * 降采样
     */
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
    },

    /**
     * 计算消耗曲线
     */
    calculateConsumptionCurve(pools, timePoints) {
      // 简化版本：按卡池开始时间点累计消耗
      const simpleCurve = [];
      let totalSoFar = 0;
      let currentPoolIndex = 0;

      timePoints.forEach((timePoint, timeIndex) => {
        // 检查是否有新卡池开始
        while (currentPoolIndex < pools.length) {
          const pool = pools[currentPoolIndex];
          const poolStart = new Date(pool.startDate);
          if (timePoint >= poolStart) {
            totalSoFar += pool.estimatedCost || 0;
            currentPoolIndex++;
          } else {
            break;
          }
        }
        simpleCurve.push(totalSoFar);
      });

      return simpleCurve;
    },

    /**
     * 标记卡池节点
     */
    markPoolNodes(pools, timePoints, consumptionCurve, poolStartIndices) {
      const nodes = [];

      pools.forEach((pool, index) => {
        const startInfo = poolStartIndices.find(p => p.poolId === pool.poolId);
        if (startInfo && startInfo.startIndex >= 0 && startInfo.startIndex < timePoints.length) {
          nodes.push({
            poolId: pool.poolId,
            poolName: pool.poolName,
            gameName: pool.gameName,
            date: this.formatDate(new Date(pool.startDate)),
            consumption: consumptionCurve[startInfo.startIndex] || 0,
            plannedPulls: pool.plannedPulls,
            estimatedCost: pool.estimatedCost,
            timeIndex: startInfo.startIndex
          });
        }
      });

      return nodes;
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    },

    /**
     * 生成摘要信息
     */
    generateSummary(pools, totalConsumption, totalResources) {
      if (pools.length === 0) return '';
      const remaining = Math.max(0, totalResources - totalConsumption);
      return `共${pools.length}个卡池规划，预计消耗${totalConsumption.toLocaleString()}资源，剩余${remaining.toLocaleString()}资源`;
    },

    /**
     * 立即重绘
     */
    redrawNow(chartData) {
      if (!this.ctx) {
        return;
      }

      const { timePoints, consumptionCurve, remainingCurve, poolNodes } = chartData;

      this.clearCanvas();
      this.drawAxes(timePoints, consumptionCurve, remainingCurve);

      if (timePoints.length >= 2) {
        this.drawGrid();
        this.drawCurves(consumptionCurve, remainingCurve);
        this.drawPoolNodes(poolNodes, timePoints, consumptionCurve);
        this.drawLegend();
      }
    },

    /**
     * 清空画布
     */
    clearCanvas() {
      const { canvasWidth, canvasHeight } = this.data;
      if (canvasWidth > 0 && canvasHeight > 0) {
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    },

    /**
     * 绘制坐标轴
     */
    drawAxes(timePoints, consumptionCurve, remainingCurve) {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      ctx.strokeStyle = this.data.chartConfig.colors.axis;
      ctx.lineWidth = 1;

      // X轴
      ctx.beginPath();
      ctx.moveTo(left, canvasHeight - bottom);
      ctx.lineTo(canvasWidth - right, canvasHeight - bottom);
      ctx.stroke();

      // Y轴
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, canvasHeight - bottom);
      ctx.stroke();

      // 计算Y轴范围
      const maxValue = Math.max(...consumptionCurve, ...remainingCurve, 1);
      const yLabels = this.generateYLabels(maxValue);

      // Y轴标签
      yLabels.forEach((label, index) => {
        const y = canvasHeight - bottom - (index / (yLabels.length - 1)) * chartHeight;

        // 刻度线
        ctx.beginPath();
        ctx.moveTo(left - 5, y);
        ctx.lineTo(left, y);
        ctx.stroke();

        // 标签文字
        ctx.font = '10px sans-serif';
        ctx.fillStyle = this.data.chartConfig.colors.text;
        ctx.textAlign = 'right';
        ctx.fillText(this.formatNumber(label), left - 8, y + 3);
      });

      // X轴标签（时间）
      const xLabelCount = Math.min(5, timePoints.length);
      for (let i = 0; i < xLabelCount; i++) {
        const index = Math.round(i * (timePoints.length - 1) / Math.max(xLabelCount - 1, 1));
        const x = left + (index / Math.max(timePoints.length - 1, 1)) * chartWidth;
        const y = canvasHeight - bottom + 15;

        // 刻度线
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight - bottom);
        ctx.lineTo(x, canvasHeight - bottom + 5);
        ctx.stroke();

        // 标签文字
        ctx.font = '10px sans-serif';
        ctx.fillStyle = this.data.chartConfig.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText(this.formatDate(timePoints[index]), x, y);
      }
    },

    /**
     * 生成Y轴标签
     */
    generateYLabels(maxValue) {
      const step = Math.ceil(maxValue / 4 / 1000) * 1000;
      return [0, step, step * 2, step * 3, step * 4];
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'k';
      }
      return num.toString();
    },

    /**
     * 绘制网格线
     */
    drawGrid() {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      ctx.strokeStyle = this.data.chartConfig.colors.grid;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);

      // 水平网格线
      for (let i = 1; i < 4; i++) {
        const y = top + (i / 4) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(canvasWidth - right, y);
        ctx.stroke();
      }

      // 垂直网格线
      for (let i = 1; i < 5; i++) {
        const x = left + (i / 5) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, canvasHeight - bottom);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    },

    /**
     * 绘制曲线（消耗曲线 + 剩余曲线）
     */
    drawCurves(consumptionCurve, remainingCurve) {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      const maxValue = Math.max(...consumptionCurve, ...remainingCurve, 1);
      const pointCount = consumptionCurve.length;

      // 绘制消耗曲线
      this.drawSingleCurve(consumptionCurve, this.data.chartConfig.colors.consumption, maxValue, pointCount);

      // 绘制剩余曲线
      this.drawSingleCurve(remainingCurve, this.data.chartConfig.colors.remaining, maxValue, pointCount);
    },

    /**
     * Hex颜色转Rgba
     */
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * 绘制单条曲线
     */
    drawSingleCurve(curve, color, maxValue, pointCount) {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      if (curve.length < 2) return;

      // 映射数据点到Canvas坐标
      const points = curve.map((value, index) => ({
        x: left + (index / Math.max(pointCount - 1, 1)) * chartWidth,
        y: top + (1 - value / maxValue) * chartHeight
      }));

      // 绘制曲线
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.stroke();

      // 绘制填充区域
      ctx.fillStyle = this.hexToRgba(color, 0.2);
      ctx.beginPath();
      ctx.moveTo(points[0].x, canvasHeight - bottom);
      ctx.lineTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.lineTo(points[points.length - 1].x, canvasHeight - bottom);
      ctx.closePath();
      ctx.fill();
    },

    /**
     * 绘制卡池节点
     */
    drawPoolNodes(poolNodes, timePoints, consumptionCurve) {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      const maxValue = Math.max(...consumptionCurve, 1);

      poolNodes.forEach(node => {
        const x = left + (node.timeIndex / Math.max(timePoints.length - 1, 1)) * chartWidth;
        const y = top + (1 - node.consumption / maxValue) * chartHeight;

        // 绘制节点圆点
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = this.data.chartConfig.colors.node;
        ctx.fill();

        // 绘制节点边框
        ctx.strokeStyle = (CHART_COLORS[this.theme] || CHART_COLORS.light).labelBg;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制节点标签（卡池名称）
        ctx.font = '9px sans-serif';
        ctx.fillStyle = this.data.chartConfig.colors.text;
        ctx.textAlign = 'center';
        const labelText = node.poolName.length > 6 ? node.poolName.substring(0, 6) + '...' : node.poolName;
        ctx.fillText(labelText, x, y - 10);
      });
    },

    /**
     * 绘制图例
     */
    drawLegend() {
      const ctx = this.ctx;
      const { canvasWidth, canvasHeight } = this.data;
      const { bottom } = this.data.chartMargin;

      const legendY = canvasHeight - bottom + 25;
      const legendX1 = canvasWidth / 2 - 60;
      const legendX2 = canvasWidth / 2 + 20;

      // 消耗曲线图例
      ctx.fillStyle = this.data.chartConfig.colors.consumption;
      ctx.fillRect(legendX1, legendY - 5, 15, 3);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = this.data.chartConfig.colors.text;
      ctx.textAlign = 'left';
      ctx.fillText('消耗', legendX1 + 20, legendY);

      // 剩余曲线图例
      ctx.fillStyle = this.data.chartConfig.colors.remaining;
      ctx.fillRect(legendX2, legendY - 5, 15, 3);
      ctx.fillStyle = this.data.chartConfig.colors.text;
      ctx.fillText('剩余', legendX2 + 20, legendY);
    },

    /**
     * 触摸开始
     */
    onTouchStart(e) {
      if (!e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      this.handleTouch(touch);
    },

    /**
     * 触摸移动
     */
    onTouchMove(e) {
      if (!e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      this.handleTouch(touch);
    },

    /**
     * 触摸结束
     */
    onTouchEnd(e) {
      // 清除选中状态
      this.setData({
        selectedNode: null
      });
    },

    /**
     * 处理触摸事件
     */
    handleTouch(touch) {
      const { poolNodes, timePoints } = this.data.chartData;
      if (!poolNodes || poolNodes.length === 0) return;

      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      const touchX = touch.x;
      const touchY = touch.y;

      // 查找最近的节点
      let nearestNode = null;
      let minDistance = Infinity;

      poolNodes.forEach(node => {
        const x = left + (node.timeIndex / Math.max(timePoints.length - 1, 1)) * chartWidth;
        const distance = Math.abs(touchX - x);

        if (distance < minDistance && distance < 30) {
          minDistance = distance;
          nearestNode = node;
        }
      });

      if (nearestNode) {
        const nodeX = left + (nearestNode.timeIndex / Math.max(timePoints.length - 1, 1)) * chartWidth;
        this.setData({
          selectedNode: nearestNode,
          tooltipX: nodeX,
          tooltipY: top
        });
      } else {
        this.setData({
          selectedNode: null
        });
      }
    }
  }
});
