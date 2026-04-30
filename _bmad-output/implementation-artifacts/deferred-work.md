# Deferred Work

Track issues discovered during code review but deferred for future action.

---

## Deferred from: code review of 3-4-smart-suggestion-card.md (2026-04-05)

- risk-analyzer.js和suggestion-generator.js的验证问题 — 属于Story 3.3文件，延后到下次修改Story 3.3时处理。包括：target.requiredPulls/hardPity undefined、empty suggestions array、calculateResourceGap NaN。
- expanded属性无事件通知父组件 — onTap切换expanded但无triggerEvent，父组件无法监听展开状态。纯展示组件可接受，延后到有需求时添加。
- priority字段赋值逻辑问题 — danger级别priority=1，与high级别相同，不符合"优先级1-5"语义。属于Story 3.3问题，延后处理。

---

## Resolved: Quick Dev split decision (2026-04-12) → Correct Course (2026-04-12)

**目标：总体规划展示功能**

在首页增加用户所有记录游戏的总体规划展示：
- 总资源数量汇总
- 各游戏资源分配比例
- 各游戏达成概率汇总
- 综合建议展示

**状态：已完成 (2026-04-12)** — 已实现上述功能，概率计算bug已修复。

---

## New Stories Created from Correct Course Analysis (2026-04-12)

通过Correct Course分析发现的设计偏离问题，已创建新Story处理：

### 问题1: 计算规则不可修改
- **问题描述**: 概率计算规则（baseRate、hardPity、softPityStart等）硬编码在游戏配置中，玩家无法修改
- **解决方案**: 创建 **Story 5.9: 玩家可配置概率参数**
- **FR覆盖**: FR40, FR41, FR42, FR43
- **技术要点**: 新增规则设置页面，扩展storage存储自定义参数，config-loader优先加载用户配置

### 问题2: 卡池时间未考虑
- **问题描述**: 很多游戏卡池有时间长度，玩家可以在卡池期间获取额外资源（每日收入），概率会随时间变化
- **解决方案**: 创建 **Story 2.10: 卡池时间范围设置与动态概率预测**
- **FR覆盖**: FR13, FR22
- **技术要点**: 新增卡池时间输入UI，扩展target对象，概率计算支持时间维度，展示动态概率曲线

### 问题3: 综合概率缺失
- **问题描述**: 用户期望看到"原神和崩铁合在一起"的综合概率，当前只显示各自独立的概率
- **解决方案**: 创建 **Story 2.11: 多游戏综合概率计算**
- **FR覆盖**: FR3, FR18
- **技术要点**: 新增combined-probability-calculator.js，首页展示综合概率和最优策略建议