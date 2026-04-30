// components/probability-chart/probability-chart.js
// 概率分布图表组件
// 支持动态概率预测曲线展示

const MAX_CHART_POINTS = 100;
const DRAW_THROTTLE_MS = 100;

Component({
  /**
   * 组件属性
   */
  properties: {
    // 概率分布数组（当前资源）
    distribution: {
      type: Array,
      value: [],
      observer: 'onDistributionChange'
    },
    // 当前抽数
    currentPulls: {
      type: Number,
      value: 0,
      observer: 'onCurrentPullsChange'
    },
    // 动态概率预测时间线（可选）
    probabilityTimeline: {
      type: Array,
      value: [],
      observer: 'onTimelineChange'
    },
    // 最优等待天数（可选）
    optimalWaitDays: {
      type: Number,
      value: 0
    },
    // 卡池结束时的总抽数（可选）
    finalPulls: {
      type: Number,
      value: 0
    },
    // 游戏配置（用于计算动态曲线）
    gameConfig: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件数据
   */
  data: {
    canvasWidth: 0,
    canvasHeight: 200,
    chartMargin: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 40
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.initCanvas();
    },
    detached() {
      if (this._drawThrottleTimer) {
        clearTimeout(this._drawThrottleTimer);
        this._drawThrottleTimer = null;
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 超过 maxPoints 时均匀采样，保持 pulls 升序
     */
    sampleDistribution(distribution, maxPoints) {
      const arr = (distribution || []).filter(
        (d) => d && typeof d.pulls === 'number' && typeof d.probability === 'number'
      );
      if (arr.length <= maxPoints) return arr;
      const sorted = [...arr].sort((a, b) => a.pulls - b.pulls);
      const n = sorted.length;
      const out = [];
      for (let i = 0; i < maxPoints; i++) {
        const idx = Math.round((i * (n - 1)) / (maxPoints - 1));
        out.push(sorted[Math.min(idx, n - 1)]);
      }
      return out;
    },

    normalizeProbability(p) {
      const n = Number(p);
      if (Number.isNaN(n)) return 0;
      return Math.min(1, Math.max(0, n));
    },

    /**
     * 在分布点上对 currentPulls 线性插值得到概率
     */
    interpolateAtPulls(distribution, pulls) {
      const arr = (distribution || [])
        .filter((d) => d && typeof d.pulls === 'number')
        .sort((a, b) => a.pulls - b.pulls);
      if (arr.length === 0) return null;
      const p = Number(pulls);
      if (Number.isNaN(p)) return null;

      const first = arr[0];
      const last = arr[arr.length - 1];
      if (p <= first.pulls) {
        return { pulls: p, probability: this.normalizeProbability(first.probability) };
      }
      if (p >= last.pulls) {
        return { pulls: p, probability: this.normalizeProbability(last.probability) };
      }
      for (let i = 0; i < arr.length - 1; i++) {
        const a = arr[i];
        const b = arr[i + 1];
        if (p >= a.pulls && p <= b.pulls) {
          const span = b.pulls - a.pulls;
          const t = span === 0 ? 0 : (p - a.pulls) / span;
          const prob =
            this.normalizeProbability(a.probability) +
            t * (this.normalizeProbability(b.probability) - this.normalizeProbability(a.probability));
          return { pulls: p, probability: this.normalizeProbability(prob) };
        }
      }
      return { pulls: p, probability: this.normalizeProbability(last.probability) };
    },

    mapDistributionToPoints(distribution, maxPullsOverride = null) {
      const maxPulls = maxPullsOverride || this.getMaxPulls();
      return distribution.map((d) =>
        this.mapToCanvas(d.pulls, this.normalizeProbability(d.probability), maxPulls)
      );
    },

    strokeSmoothCurve(ctx, points) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.stroke();
    },

    fillUnderSmoothCurve(ctx, points, baselineY) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, baselineY);
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.lineTo(points[points.length - 1].x, baselineY);
      ctx.closePath();
      ctx.fill();
    },

    /**
     * 获取图表的最大抽数（用于X轴范围）
     * 动态适配实际数据范围，避免曲线只显示在左侧
     */
    getMaxPulls() {
      const distribution = this.data.distribution || [];
      const finalPulls = this.properties.finalPulls || 0;
      const currentPulls = this.data.currentPulls || 0;

      // 获取分布数据中的最大抽数
      let distMaxPull = 0;
      if (distribution.length > 0) {
        distMaxPull = Math.max(...distribution.map(d => d.pulls || 0));
      }

      // 取所有抽数的最大值
      let maxPull = Math.max(distMaxPull, finalPulls, currentPulls);

      // 如果没有数据，返回默认值
      if (maxPull <= 0) {
        return 90;
      }

      // 添加20%的padding，让曲线不会紧贴右边缘
      // 但至少添加10抽的padding
      const padding = Math.max(Math.ceil(maxPull * 0.2), 10);
      maxPull = maxPull + padding;

      // 向上取整到漂亮的刻度（如10、20、30...或5、10、15...）
      const niceStep = this.getNiceStep(maxPull);
      maxPull = Math.ceil(maxPull / niceStep) * niceStep;

      return maxPull;
    },

    /**
     * 获取漂亮的刻度步长
     * @param {Number} maxVal - 最大值
     * @returns {Number} 步长
     */
    getNiceStep(maxVal) {
      // 根据数值大小选择合适的步长
      if (maxVal <= 20) return 5;
      if (maxVal <= 50) return 10;
      if (maxVal <= 100) return 10;
      if (maxVal <= 200) return 20;
      if (maxVal <= 500) return 50;
      return 100;
    },

    /**
     * 获取当前分布的最大抽数
     */
    getCurrentMaxPulls() {
      const distribution = this.data.distribution || [];
      if (distribution.length === 0) return 0;
      return Math.max(...distribution.map(d => d.pulls || 0));
    },

    /**
     * 初始化Canvas
     */
    initCanvas() {
      const query = this.createSelectorQuery();
      query
        .select('#probabilityCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          const dpr = wx.getSystemInfoSync().pixelRatio;

          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;

          ctx.scale(dpr, dpr);

          this.canvas = canvas;
          this.ctx = ctx;

          const pending = this._pendingRedraw;
          this._pendingRedraw = false;

          this.setData(
            {
              canvasWidth: res[0].width,
              canvasHeight: res[0].height
            },
            () => {
              const dist = this.data.distribution || [];
              if (pending || dist.length > 0) {
                this.redrawNow();
              }
            }
          );
        });
    },

    /**
     * distribution变化监听器
     */
    onDistributionChange(newVal, oldVal) {
      if (!this.ctx) {
        this._pendingRedraw = true;
        return;
      }
      this.scheduleRedraw();
    },

    /**
     * currentPulls变化监听器
     */
    onCurrentPullsChange(newVal, oldVal) {
      if (!this.ctx) {
        this._pendingRedraw = true;
        return;
      }
      const dist = this.data.distribution || [];
      if (dist.length === 0) {
        return;
      }
      this.scheduleRedraw();
    },

    /**
     * timeline变化监听器
     */
    onTimelineChange(newVal, oldVal) {
      if (!this.ctx) {
        this._pendingRedraw = true;
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
        this.redrawNow();
      }, DRAW_THROTTLE_MS);
    },

    /**
     * 立即重绘（无节流），供初始化与 setData 回调使用
     */
    redrawNow() {
      if (!this.ctx) {
        return;
      }

      const raw = this.data.distribution || [];
      const sampled = this.sampleDistribution(raw, MAX_CHART_POINTS);

      this.clearCanvas();
      this.drawAxes();

      if (sampled.length >= 2) {
        // 绘制当前概率曲线
        this.drawCurve(sampled);

        // 如果有动态预测，绘制最终概率曲线
        const timeline = this.properties.probabilityTimeline || [];
        if (timeline.length > 0 && this.properties.finalPulls > 0) {
          this.drawFinalCurve();
        }

        // 绘制当前位置标记
        this.drawCurrentPosition(raw);

        // 绘制最终位置标记（如果有动态预测）
        if (this.properties.finalPulls > 0) {
          this.drawFinalPosition(raw);
        }
      }
    },

    /**
     * 清空画布
     */
    clearCanvas() {
      const { canvasWidth, canvasHeight } = this.data;
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    },

    /**
     * 绘制坐标轴
     */
    drawAxes() {
      const ctx = this.ctx;
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      ctx.strokeStyle = '#EBE8E4';  // Gray 200
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

      // 动态计算X轴刻度
      const maxPulls = this.getMaxPulls();
      const niceStep = this.getNiceStep(maxPulls);
      const numTicks = Math.ceil(maxPulls / niceStep);

      // 绘制X轴刻度和标签（最多6个刻度）
      const maxTicks = 6;
      const actualStep = Math.ceil(numTicks / maxTicks);
      const tickInterval = niceStep * actualStep;

      for (let i = 0; i <= maxPulls; i += tickInterval) {
        const x = left + (i / maxPulls) * chartWidth;
        const y = canvasHeight - bottom + 15;

        // 绘制刻度线
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight - bottom);
        ctx.lineTo(x, canvasHeight - bottom + 5);
        ctx.stroke();

        // 绘制刻度标签
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#78716C';  // Gray 500
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x, y);
      }

      // Y轴标签
      const yLabels = ['0%', '25%', '50%', '75%', '100%'];
      yLabels.forEach((label, index) => {
        const x = left - 10;
        const y = canvasHeight - bottom - (index / 4) * chartHeight + 4;

        // 绘制刻度线
        ctx.beginPath();
        ctx.moveTo(left - 5, canvasHeight - bottom - (index / 4) * chartHeight);
        ctx.lineTo(left, canvasHeight - bottom - (index / 4) * chartHeight);
        ctx.stroke();

        // 绘制刻度标签
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#78716C';  // Gray 500
        ctx.textAlign = 'right';
        ctx.fillText(label, x, y);
      });
    },

    /**
     * 绘制概率分布曲线（贝塞尔平滑 + 填充）
     */
    drawCurve(sampledDistribution) {
      const ctx = this.ctx;
      const { bottom } = this.data.chartMargin;
      const { canvasHeight } = this.data;

      if (sampledDistribution.length < 2) return;

      const maxPulls = this.getMaxPulls();
      const points = sampledDistribution.map((d) =>
        this.mapToCanvas(d.pulls, this.normalizeProbability(d.probability), maxPulls)
      );

      ctx.strokeStyle = '#C4A77D';  // Primary
      ctx.lineWidth = 2;
      this.strokeSmoothCurve(ctx, points);

      ctx.fillStyle = 'rgba(212, 188, 153, 0.3)';  // Primary Light with 0.3 opacity
      this.fillUnderSmoothCurve(ctx, points, canvasHeight - bottom);
    },

    /**
     * 绘制最终概率曲线（动态预测）
     */
    drawFinalCurve() {
      const ctx = this.ctx;
      const { bottom } = this.data.chartMargin;
      const { canvasHeight } = this.data;
      const { distribution, gameConfig } = this.data;
      const finalPulls = this.properties.finalPulls;

      if (!distribution || distribution.length < 2 || !gameConfig || finalPulls <= 0) return;

      // 计算最终概率分布
      const finalDistribution = this.calculateFinalDistribution(distribution, finalPulls, gameConfig);
      if (finalDistribution.length < 2) return;

      const sampled = this.sampleDistribution(finalDistribution, MAX_CHART_POINTS);
      const maxPulls = this.getMaxPulls();
      const points = sampled.map((d) =>
        this.mapToCanvas(d.pulls, this.normalizeProbability(d.probability), maxPulls)
      );

      // 使用不同颜色绘制最终曲线
      ctx.strokeStyle = '#7FB069';  // Success Green
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);  // 虚线样式
      this.strokeSmoothCurve(ctx, points);
      ctx.setLineDash([]);

      // 填充区域（更浅的颜色）
      ctx.fillStyle = 'rgba(127, 176, 105, 0.2)';
      this.fillUnderSmoothCurve(ctx, points, canvasHeight - bottom);
    },

    /**
     * 计算最终概率分布（基于最终抽数）
     */
    calculateFinalDistribution(currentDistribution, finalPulls, config) {
      // 如果最终抽数不超过当前最大抽数，返回当前分布
      const currentMaxPull = Math.max(...currentDistribution.map(d => d.pulls || 0));
      if (finalPulls <= currentMaxPull) {
        return currentDistribution;
      }

      // 扩展分布到最终抽数
      const hardPity = config.hardPity || 90;
      const baseRate = config.baseRate || 0.006;
      const softPityStart = config.softPityStart || 74;
      const softPityIncrement = config.softPityIncrement || 0.06;

      const finalDistribution = [...currentDistribution];
      const lastPoint = currentDistribution[currentDistribution.length - 1];

      // 从当前最大抽数开始计算到最终抽数
      for (let pulls = currentMaxPull + 1; pulls <= Math.min(finalPulls, hardPity); pulls++) {
        let cumulativeProb = lastPoint.probability;

        // 计算单抽概率
        let singleRate = baseRate;
        if (pulls >= softPityStart) {
          singleRate = baseRate + (pulls - softPityStart + 1) * softPityIncrement;
        }

        // 累积概率
        const prevCumulative = finalDistribution[finalDistribution.length - 1].probability;
        cumulativeProb = prevCumulative + (1 - prevCumulative) * singleRate;

        finalDistribution.push({
          pulls,
          probability: cumulativeProb
        });
      }

      return finalDistribution;
    },

    /**
     * 绘制当前位置标记（基于原始分布插值）
     */
    drawCurrentPosition(rawDistribution) {
      const ctx = this.ctx;
      const currentPulls = this.data.currentPulls;
      const { bottom } = this.data.chartMargin;
      const { canvasHeight } = this.data;

      if (currentPulls <= 0) return;

      const maxPulls = this.getMaxPulls();
      const currentPoint = this.interpolateAtPulls(rawDistribution, currentPulls);
      if (!currentPoint) return;

      const { x, y } = this.mapToCanvas(currentPoint.pulls, currentPoint.probability, maxPulls);

      ctx.beginPath();
      ctx.strokeStyle = '#C4A77D';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x, y);
      ctx.lineTo(x, canvasHeight - bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#C4A77D';
      ctx.fill();

      const probPercent = Math.round(currentPoint.probability * 100);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#44403C';  // Gray 700
      ctx.textAlign = 'center';
      ctx.fillText(`${currentPulls}抽 (${probPercent}%)`, x, y - 12);
    },

    /**
     * 绘制最终位置标记
     */
    drawFinalPosition(rawDistribution) {
      const ctx = this.ctx;
      const finalPulls = this.properties.finalPulls;
      const { bottom } = this.data.chartMargin;
      const { canvasHeight } = this.data;

      if (finalPulls <= 0) return;

      const maxPulls = this.getMaxPulls();
      const { gameConfig } = this.data;

      // 计算最终分布
      const finalDistribution = this.calculateFinalDistribution(rawDistribution, finalPulls, gameConfig);
      const finalPoint = this.interpolateAtPulls(finalDistribution, finalPulls);
      if (!finalPoint) return;

      const { x, y } = this.mapToCanvas(finalPoint.pulls, finalPoint.probability, maxPulls);

      ctx.beginPath();
      ctx.strokeStyle = '#7FB069';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x, y);
      ctx.lineTo(x, canvasHeight - bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#7FB069';
      ctx.fill();

      const probPercent = Math.round(finalPoint.probability * 100);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#44403C';  // Gray 700
      ctx.textAlign = 'center';
      ctx.fillText(`${finalPulls}抽 (${probPercent}%)`, x, y - 12);
    },

    /**
     * 数据坐标映射到Canvas坐标
     * @param {Number} pulls - 抽数
     * @param {Number} probability - 概率
     * @param {Number} maxPulls - X轴最大抽数
     * @returns {Object} Canvas坐标 {x, y}
     */
    mapToCanvas(pulls, probability, maxPulls) {
      const { left, right, top, bottom } = this.data.chartMargin;
      const { canvasWidth, canvasHeight } = this.data;
      const chartWidth = canvasWidth - left - right;
      const chartHeight = canvasHeight - top - bottom;

      const effectiveMaxPulls = maxPulls || this.getMaxPulls();
      const x = left + (pulls / effectiveMaxPulls) * chartWidth;
      const y = top + (1 - probability) * chartHeight;

      return { x, y };
    }
  }
});
