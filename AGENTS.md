# GachaPlanner 项目指南

> 本项目为微信小程序（微信基础库 3.15.2，目标兼容 2.11.0+），使用原生框架开发，无 Taro/UniApp 等框架层。

## 设计原则

### 交互设计

1. **平台优先**：所有设计必须遵守微信小程序平台约束
   - `wx.showActionSheet` 最多 6 项，超过必须用自定义页面
   - `wx.showModal` 最多 2 个按钮
   - 页面栈最多 10 层，深层导航用 `redirectTo`
   - 触摸目标最小 44×44rpx

2. **手势降级**：小程序 `touchmove` 精度有限
   - 复杂拖动交互降级为点击
   - 长按避免作为唯一交互方式
   - 左右滑动与页面返回手势冲突，谨慎使用

3. **状态完整性**：每个列表/搜索必须有加载态、空状态、错误态
   - 空状态三要素：图标 + 说明文字 + 操作引导
   - 禁止只显示"暂无数据"

4. **返回预期**：页面跳转链的返回行为必须明确
   - 从 A → B → C，C 返回时应明确回到 A 还是 B
   - 使用 `redirectTo` 跳过中间页，或 `navigateBack({ delta: 2 })`

5. **信息密度**：单屏信息不超过 7±2 个认知单元
   - 卡片至少包含：主信息 + 1 行辅助信息
   - 避免信息孤岛（只有名称没有任何上下文）

6. **概念唯一**：同一页面内避免同名概念冲突
   - 分类 Tab 的"热门" vs 排序的"热门" → 二选一或重命名

### 视觉设计

1. **语义化变量**：所有颜色必须使用 CSS 变量，禁止硬编码
   - 变量前缀：`--color-*`
   - 来源：`app.wxss` 是唯一定义处
   - 深色模式通过 `.dark-mode` 和 `@media` 覆盖

2. **对比度标准**：
   - 正文文字 ≥ 4.5:1
   - 大字号（≥18px 或 ≥14px bold）≥ 3:1
   - 装饰性元素（图标、进度条）可放宽

3. **缺省策略**：无图标/无图片时必须提供代码生成的缺省占位
   - 根据 ID 哈希分配不同颜色，避免所有占位一样
   - 加载失败通过 `binderror` 降级

4. **点击态**：不使用 `transform: scale()`
   - 小程序中 scale 可能被父容器 `overflow: hidden` 截断
   - 改用 `opacity` + `background-color` 变化

## 技术规范

### 架构约定

1. **主题系统**：`services/theme-service.js` 单例
   - 三档：light / dark / system
   - 每个页面 `onShow` 必须调用 `themeService.apply()`
   - 页面根 view 绑定 `class="{{themeClass}}"`
   - Canvas 组件注册 `themeService.onChange` 监听重绘

2. **导航栏**：所有页面统一使用 `custom-nav-bar` 组件
   - `app.json` 全局 `"navigationStyle": "custom"`
   - 组件路径：`../../components/custom-nav-bar/custom-nav-bar`
   - 组件监听 `themeService.onChange` 自身变色（避免样式隔离问题）

3. **样式隔离**：所有组件 `.json` 必须 `"styleIsolation": "apply-shared"`
   - 使组件能继承父页面的 `.dark-mode` CSS 变量覆盖

4. **按钮重置**：`app.wxss` 全局重置
   ```css
   button { padding: 0; margin: 0; border: none; background: none; }
   ```
   - 按钮居中使用 `display: flex`，不用 `line-height`

### 代码规范

1. **配置加载**：显式注册表，禁止动态扫描
   ```javascript
   // ❌ 错误：小程序无 fs 模块
   const config = require('./games/' + gameId);

   // ✅ 正确：显式注册
   const GAME_CONFIGS = {
     genshin: require('./games/genshin'),
     starrail: require('./games/starrail')
   };
   ```

2. **防抖复用**：搜索/输入场景使用 `utils/debounce.js`
   ```javascript
   const debounce = require('../../utils/debounce');
   this._debouncedSearch = debounce(this._doSearch, 150);
   ```

3. **结果对象**：使用 `utils/result.js` 的工厂函数
   ```javascript
   const { success, error } = require('../utils/result');
   return success(data);
   return error('错误信息');
   ```

4. **监听器管理**：`attached` 注册必须对应 `detached` 注销
   ```javascript
   attached() {
     this._themeCb = (t) => this.setData({ themeClass: t });
     themeService.onChange(this._themeCb);
   },
   detached() {
     themeService.offChange(this._themeCb);
   }
   ```

5. **字段变更全链路**：配置模型变更时必须分析完整影响面
   - 从 `config/games/*.js` → `config-loader.js` → `services/` → `pages/` → `core/`
   - 每个文件中有多少处直接访问旧字段
   - 使用 grep 统计影响面

### 渐进式迁移策略

当需要变更核心数据模型时：

```
Step 1: 新模型 + 兼容层
├── 新模型使用新字段
└── 同时保留旧字段作为别名
    （现有代码无需修改即可运行）

Step 2: 按模块渐进迁移
├── 选一个模块（如 planning）
├── 改该模块的字段访问方式
├── 测试该模块功能正常
└── 再迁移下一个模块

Step 3: 删除兼容层
├── 确认所有模块已适配
├── 删除旧字段别名
└── 全量回归测试
```

### 性能规范

1. **setData**：单次 ≤ 1MB，大数据列表分页
2. **搜索过滤**：防抖 150ms，避免频繁 setData
3. **Canvas 重绘**：节流 100ms，主题切换时重绘
4. **图片加载**：懒加载 + `binderror` 降级
5. **Storage**：单 key ≤ 1MB，总量 ≤ 10MB，定期清理
6. **动画**：使用 `transform` 和 `opacity`，避免触发布局重排

## 审查 Checklist

每次创建 change proposal 前，对照以下清单自查：

### 交互自查
- [ ] 是否有超过 6 项的 ActionSheet？
- [ ] 是否有复杂的拖动交互？（建议降级为点击）
- [ ] 每个列表/搜索是否有空状态设计？
- [ ] 页面跳转链的返回行为是否明确？
- [ ] 是否有同名概念冲突？
- [ ] 触摸目标是否 ≥ 44rpx？

### 技术自查
- [ ] 是否有动态 `require`？（必须用显式注册表）
- [ ] 字段变更是否分析了全链路影响？
- [ ] 是否有渐进式迁移计划？
- [ ] 所有组件是否 `"styleIsolation": "apply-shared"`？
- [ ] 所有颜色是否使用 CSS 变量？
- [ ] 监听器是否有对应的注销逻辑？
- [ ] 搜索/输入是否有防抖？
