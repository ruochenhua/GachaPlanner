import re

filepath = 'components/probability-chart/probability-chart.js'
with open(filepath, 'r') as f:
    content = f.read()

imports = """const MAX_CHART_POINTS = 100;
const DRAW_THROTTLE_MS = 100;
const themeService = require('../../services/theme-service');

const CHART_COLORS = {
  light: {
    grid: '#EBE8E4',
    gridLine: '#F0EDE9',
    text: '#78716C',
    primary: '#C4A77D',
    primaryFillStart: 'rgba(196, 167, 125, 0.35)',
    primaryFillEnd: 'rgba(196, 167, 125, 0.02)',
    success: '#7FB069',
    successFillStart: 'rgba(127, 176, 105, 0.25)',
    successFillEnd: 'rgba(127, 176, 105, 0.02)',
    labelText: '#44403C',
    labelBg: 'rgba(255, 255, 255, 0.9)'
  },
  dark: {
    grid: '#3E3833',
    gridLine: '#292524',
    text: '#A8A29E',
    primary: '#D4BC99',
    primaryFillStart: 'rgba(212, 188, 153, 0.25)',
    primaryFillEnd: 'rgba(212, 188, 153, 0.01)',
    success: '#8BC476',
    successFillStart: 'rgba(139, 196, 118, 0.2)',
    successFillEnd: 'rgba(139, 196, 118, 0.01)',
    labelText: '#F5F3F0',
    labelBg: 'rgba(41, 37, 36, 0.9)'
  }
};

"""

content = content.replace('const MAX_CHART_POINTS = 100;\nconst DRAW_THROTTLE_MS = 100;', imports.strip())

content = content.replace(
    'detached() {\n      if (this._drawThrottleTimer) {',
    'detached() {\n      themeService.offChange(this._onThemeChange);\n      if (this._drawThrottleTimer) {'
)

content = content.replace(
    'attached() {\n      this.initCanvas();',
    'attached() {\n      this.theme = themeService.resolve();\n      this._onThemeChange = (theme) => {\n        this.theme = theme;\n        this.redrawNow();\n      };\n      themeService.onChange(this._onThemeChange);\n      this.initCanvas();'
)

# 替换所有颜色引用
replacements = [
    ("ctx.strokeStyle = '#EBE8E4';  // Gray 200", "ctx.strokeStyle = this.colors().grid;"),
    ("ctx.fillStyle = '#78716C';  // Gray 500", "ctx.fillStyle = this.colors().text;"),
    ("ctx.strokeStyle = '#F0EDE9';", "ctx.strokeStyle = this.colors().gridLine;"),
    ("ctx.fillStyle = '#78716C';", "ctx.fillStyle = this.colors().text;"),
    ("ctx.strokeStyle = '#EBE8E4';", "ctx.strokeStyle = this.colors().grid;"),
    ("ctx.strokeStyle = '#C4A77D';", "ctx.strokeStyle = this.colors().primary;"),
    ("gradient.addColorStop(0, 'rgba(196, 167, 125, 0.35)');", "gradient.addColorStop(0, this.colors().primaryFillStart);"),
    ("gradient.addColorStop(1, 'rgba(196, 167, 125, 0.02)');", "gradient.addColorStop(1, this.colors().primaryFillEnd);"),
    ("ctx.strokeStyle = '#7FB069';", "ctx.strokeStyle = this.colors().success;"),
    ("gradient.addColorStop(0, 'rgba(127, 176, 105, 0.25)');", "gradient.addColorStop(0, this.colors().successFillStart);"),
    ("gradient.addColorStop(1, 'rgba(127, 176, 105, 0.02)');", "gradient.addColorStop(1, this.colors().successFillEnd);"),
    ("ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';", "ctx.fillStyle = this.colors().labelBg;"),
    ("ctx.fillStyle = '#44403C';", "ctx.fillStyle = this.colors().labelText;"),
]

for old, new in replacements:
    content = content.replace(old, new)

# 添加 colors 方法
methods_insert = '''    colors() {
      return CHART_COLORS[this.theme] || CHART_COLORS.light;
    },

'''
content = content.replace(
    '    strokeSmoothCurve(ctx, points) {',
    methods_insert + '    strokeSmoothCurve(ctx, points) {'
)

with open(filepath, 'w') as f:
    f.write(content)

print('probability-chart.js updated')
