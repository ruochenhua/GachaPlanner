/**
 * 历史数据趋势图表组件
 * 使用Canvas绘制资源变化曲线和规划频率趋势
 */

const historyService = require('../../services/history-service');
const { formatDate } = require('../../utils/time');

Component({
  properties: {
    // 显示天数范围
    daysRange: {
      type: Number,
      value: 30
    },
    // 游戏ID筛选
    gameId: {
      type: String,
      value: ''
    }
  },

  data: {
    // Canvas宽度
    canvasWidth: 0,
    // Canvas高度
    canvasHeight: 200,
    // 是否正在加载
    loading: true,
    // 是否有数据
    hasData: false,
    // 时间序列数据
    timeSeriesData: [],
    // 事件标记列表
    eventMarkers: []
  },

  lifetimes: {
    attached() {
      this.initCanvas();
    }
  },

  observers: {
    'gameId, daysRange': function() {
      this.loadData();
    }
  },

  methods: {
    /**
     * 初始化Canvas
     */
    initCanvas() {
      const query = this.createSelectorQuery();
      query.select('#trendCanvas').fields({ node: true, size: true }).exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          const dpr = wx.getSystemInfoSync().pixelRatio;
          const width = res[0].width;
          const height = this.data.canvasHeight;

          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          this.canvas = canvas;
          this.ctx = ctx;
          this.setData({ canvasWidth: width });

          this.loadData();
        }
      });
    },

    /**
     * 加载并处理数据
     */
    loadData() {
      this.setData({ loading: true });

      const result = historyService.loadHistory({
        gameId: this.data.gameId || undefined,
        limit: 100 // 获取足够数据用于趋势分析
      });

      if (result.success) {
        const records = result.data.records;

        if (records.length > 0) {
          const { timeSeriesData, eventMarkers } = this.processData(records);
          this.setData({
            timeSeriesData,
            eventMarkers,
            hasData: true,
            loading: false
          });

          this.drawChart();
        } else {
          this.setData({
            hasData: false,
            loading: false
          });
        }
      } else {
        this.setData({
          hasData: false,
          loading: false
        });
      }
    },

    /**
     * 处理数据生成时间序列
     * @param {Array} records 历史记录列表
     * @returns {Object} 处理后的数据
     */
    processData(records) {
      const now = Date.now();
      const startTime = now - this.data.daysRange * 24 * 60 * 60 * 1000;

      // 按天聚合
      const dailyData = {};
      const eventMarkers = [];

      records.forEach(record => {
        // 只处理指定时间范围内的记录
        if (record.createdAt < startTime) return;

        const dayKey = formatDate(record.createdAt);
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            date: dayKey,
            timestamp: record.createdAt,
            resourcesUsed: 0,
            pullsUsed: 0,
            count: 0,
            successes: 0,
            failures: 0
          };
        }

        dailyData[dayKey].resourcesUsed += record.resourcesUsed || 0;
        dailyData[dayKey].pullsUsed += record.pullsUsed || 0;
        dailyData[dayKey].count++;
        if (record.actualResult === 'success') {
          dailyData[dayKey].successes++;
        }
        if (record.actualResult === 'failure') {
          dailyData[dayKey].failures++;
        }

        // 重要事件标记
        if (record.pullsUsed >= 50 || record.resourcesUsed >= 8000) {
          eventMarkers.push({
            date: dayKey,
            timestamp: record.createdAt,
            type: record.actualResult === 'success' ? 'success' : 'important',
            label: record.poolName
          });
        }
      });

      // 转换为数组并排序
      const timeSeriesData = Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp);

      // 填充缺失的日期
      const filledData = this.fillMissingDates(timeSeriesData, startTime, now);

      return { timeSeriesData: filledData, eventMarkers };
    },

    /**
     * 填充缺失日期
     */
    fillMissingDates(data, startTime, endTime) {
      const filled = [];
      const existingDates = new Set(data.map(d => d.date));

      for (let t = startTime; t <= endTime; t += 24 * 60 * 60 * 1000) {
        const dayKey = formatDate(t);
        if (existingDates.has(dayKey)) {
          filled.push(data.find(d => d.date === dayKey));
        } else {
          filled.push({
            date: dayKey,
            timestamp: t,
            resourcesUsed: 0,
            pullsUsed: 0,
            count: 0,
            successes: 0,
            failures: 0
          });
        }
      }

      return filled;
    },

    /**
     * 绘制图表
     */
    drawChart() {
      if (!this.ctx || !this.data.hasData) return;

      const startTime = Date.now();
      const ctx = this.ctx;
      const width = this.data.canvasWidth;
      const height = this.data.canvasHeight;
      const padding = { top: 20, right: 20, bottom: 40, left: 50 };

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制背景
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, width, height);

      const data = this.data.timeSeriesData;

      // 计算数据范围
      const maxResources = Math.max(...data.map(d => d.resourcesUsed), 100);
      const maxCount = Math.max(...data.map(d => d.count), 1);

      // 绘制网格线
      this.drawGrid(ctx, width, height, padding);

      // 绘制资源曲线
      this.drawResourceCurve(ctx, data, width, height, padding, maxResources);

      // 绘制规划频率
      this.drawFrequencyBars(ctx, data, width, height, padding, maxCount);

      // 绘制事件标记
      this.drawEventMarkers(ctx, width, height, padding, data.length);

      // 绘制坐标轴标签
      this.drawAxisLabels(ctx, width, height, padding, maxResources, data);

      // 性能检查
      const drawTime = Date.now() - startTime;
      console.log(`✓ 图表绘制完成，耗时: ${drawTime}ms`);

      if (drawTime > 500) {
        console.warn(`⚠ 图表绘制耗时 ${drawTime}ms > 500ms`);
      }
    },

    /**
     * 绘制网格线
     */
    drawGrid(ctx, width, height, padding) {
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      ctx.strokeStyle = '#D4D4D4';
      ctx.lineWidth = 1;

      // 横向网格线
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
    },

    /**
     * 绘制资源曲线
     */
    drawResourceCurve(ctx, data, width, height, padding, maxValue) {
      if (data.length === 0) return;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      ctx.strokeStyle = '#C4A77D';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i;
        const y = padding.top + chartHeight - (d.resourcesUsed / maxValue) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制填充区域
      ctx.fillStyle = 'rgba(196, 167, 125, 0.1)';
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i;
        const y = padding.top + chartHeight - (d.resourcesUsed / maxValue) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // 闭合填充区域
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();
    },

    /**
     * 绘制规划频率柱状图
     */
    drawFrequencyBars(ctx, data, width, height, padding, maxValue) {
      if (data.length === 0 || maxValue === 0) return;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const barWidth = Math.max(2, chartWidth / data.length - 2);

      ctx.fillStyle = 'rgba(127, 176, 105, 0.3)';

      data.forEach((d, i) => {
        if (d.count === 0) return;

        const x = padding.left + (chartWidth / data.length) * i;
        const barHeight = (d.count / maxValue) * (chartHeight * 0.3);
        const y = height - padding.bottom - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
      });
    },

    /**
     * 绘制事件标记
     */
    drawEventMarkers(ctx, width, height, padding, dataLength) {
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const markers = this.data.eventMarkers;

      markers.forEach(marker => {
        // 找到对应日期的位置
        const dataIndex = this.data.timeSeriesData.findIndex(d => d.date === marker.date);
        if (dataIndex === -1) return;

        const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * dataIndex;
        const y = padding.top + chartHeight * 0.5;

        // 绘制标记点
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = marker.type === 'success' ? '#7FB069' : '#C4A77D';
        ctx.fill();
      });
    },

    /**
     * 绘制坐标轴标签
     */
    drawAxisLabels(ctx, width, height, padding, maxValue, data) {
      ctx.fillStyle = '#6B6B6B';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Y轴标签
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + ((height - padding.top - padding.bottom) / 4) * i;
        const value = Math.round(maxValue - (maxValue / 4) * i);
        ctx.fillText(value.toString(), padding.left - 10, y);
      }

      // X轴标签（只显示部分）
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const labelCount = Math.min(5, data.length);
      const step = Math.floor(data.length / labelCount);

      for (let i = 0; i < labelCount; i++) {
        const index = i * step;
        if (index >= data.length) break;

        const x = padding.left + ((width - padding.left - padding.right) / (data.length - 1 || 1)) * index;
        const date = data[index].date.slice(5); // 只显示月-日
        ctx.fillText(date, x, height - padding.bottom + 10);
      }
    },

    /**
     * 刷新图表
     */
    refresh() {
      this.loadData();
    }
  }
});