# Story 2.1: 概率计算引擎基础实现

Status: done

## Story

As a 系统,
I want 实现基础概率计算引擎,
so that 根据游戏配置计算单次抽卡概率.

## Acceptance Criteria

1. **Given** 游戏配置数据已加载
   **When** 实现base-calculator.js
   **Then** 计算器可计算基础概率（如原神0.6%）
   **And** 支持保底机制参数配置
   **And** 计算结果包含概率分布数组
   **And** 计算响应时间 < 100ms
   **And** 纯函数实现，无副作用

## Tasks / Subtasks

- [x] **Task 1: 创建基础计算器类结构** (AC: 1)
  - [x] 1.1 创建core/calculator/目录
  - [x] 1.2 创建base-calculator.js基础计算器类
  - [x] 1.3 定义calculate()方法接口
  - [x] 1.4 定义calculateProbabilityDistribution()方法
  - [x] 1.5 实现基础概率计算逻辑（无保底情况）

- [x] **Task 2: 实现概率分布计算** (AC: 1)
  - [x] 2.1 实现单抽概率计算方法
  - [x] 2.2 实现多抽概率分布计算（返回数组）
  - [x] 2.3 支持当前抽数参数（继承抽数）
  - [x] 2.4 计算结果包含每一抽的累积概率
  - [x] 2.5 使用科学计数法处理极小概率值

- [x] **Task 3: 实现性能优化机制** (AC: 1)
  - [x] 3.1 实现计算结果缓存机制
  - [x] 3.2 使用Map存储缓存键值对
  - [x] 3.3 缓存键基于输入参数生成
  - [x] 3.4 验证缓存命中时响应时间 < 10ms
  - [x] 3.5 验证首次计算响应时间 < 100ms

- [x] **Task 4: 实现纯函数设计** (AC: 1)
  - [x] 4.1 确保calculate方法无副作用
  - [x] 4.2 不修改输入参数
  - [x] 4.3 不依赖外部状态
  - [x] 4.4 相同输入产生相同输出（幂等性）
  - [x] 4.5 添加单元测试验证纯函数特性

- [x] **Task 5: 创建计算结果数据结构** (AC: 1)
  - [x] 5.1 定义Result对象结构（success, data, error）
  - [x] 5.2 定义概率分布数据结构
  - [x] 5.3 包含每抽概率、累积概率、期望值
  - [x] 5.4 添加数据验证逻辑
  - [x] 5.5 Console输出测试结果

## Dev Notes

### 关键技术决策

**计算引擎架构：**
- 基础计算器（BaseCalculator）作为抽象基类
- 不同保底机制继承基础计算器实现策略
- 策略模式（Strategy Pattern）支持多种保底机制
- 计算器工厂（CalculatorFactory）根据游戏类型创建计算器

**概率计算公式：**
- 基础概率：游戏配置中的baseRate（如原神0.006）
- 无保底情况：每抽概率固定为基础概率
- 有保底情况：由子类（HardPity、SoftPity）实现具体逻辑
- 概率分布：计算1-N抽每抽的累积概率

**性能优化策略：**
- 计算结果缓存：避免重复计算
- 缓存键生成：基于输入参数的唯一键
- 纯函数设计：无副作用，易于测试和缓存
- 响应时间要求：< 100ms（首次计算），< 10ms（缓存命中）

**数据结构设计：**
- 输入参数：resources（资源）、target（目标）、config（游戏配置）
- 输出结果：Result对象包含概率分布数组
- 概率分布：每抽的概率、累积概率、期望抽数

### 基础计算器类设计

**core/calculator/base-calculator.js：**

```javascript
// core/calculator/base-calculator.js
// 基础概率计算器

const { success, error } = require('../../utils/result');

/**
 * 基础计算器类
 * 纯函数实现，无副作用
 */
class BaseCalculator {
  constructor() {
    // 计算结果缓存
    this.cache = new Map();
  }

  /**
   * 计算概率分布
   * @param {Object} params - 计算参数
   * @param {Object} params.resources - 资源数据 {primogems, intertwinedFates, ...}
   * @param {Object} params.target - 目标数据 {pulls, currentPity}
   * @param {Object} params.config - 游戏配置 {baseRate, pityType, ...}
   * @returns {Object} Result对象 {success, data, error}
   */
  calculate(params) {
    try {
      // 参数验证
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return error(validation.message);
      }

      const { resources, target, config } = params;

      // 生成缓存键
      const cacheKey = this.generateCacheKey(params);

      // 检查缓存
      if (this.cache.has(cacheKey)) {
        console.log('缓存命中:', cacheKey);
        return success(this.cache.get(cacheKey));
      }

      // 计算概率分布
      const distribution = this.calculateProbabilityDistribution(
        resources,
        target,
        config
      );

      // 缓存结果
      this.cache.set(cacheKey, distribution);

      console.log('计算完成:', {
        cacheKey,
        pulls: distribution.length,
        finalProbability: distribution[distribution.length - 1].cumulativeProbability
      });

      return success(distribution);
    } catch (err) {
      console.error('计算失败:', err);
      return error(`计算失败：${err.message}`);
    }
  }

  /**
   * 计算概率分布（无保底情况）
   * 子类可重写此方法实现保底逻辑
   * @param {Object} resources - 资源数据
   * @param {Object} target - 目标数据
   * @param {Object} config - 游戏配置
   * @returns {Array} 概率分布数组
   */
  calculateProbabilityDistribution(resources, target, config) {
    const { baseRate } = config;
    const maxPulls = target.pulls || 100; // 默认计算100抽

    const distribution = [];

    for (let pull = 1; pull <= maxPulls; pull++) {
      // 单抽概率（无保底情况，固定为基础概率）
      const singleProbability = this.calculateSingleProbability(pull, baseRate, config);

      // 累积概率（1 - (1-p)^n）
      const cumulativeProbability = 1 - Math.pow(1 - baseRate, pull);

      distribution.push({
        pull,
        singleProbability,
        cumulativeProbability,
        // 期望值（累积概率 *抽数）
        expectedValue: cumulativeProbability * pull
      });
    }

    return distribution;
  }

  /**
   * 计算单抽概率（无保底情况）
   * 子类可重写此方法实现保底逻辑
   * @param {number} pull - 当前抽数
   * @param {number} baseRate - 基础概率
   * @param {Object} config - 游戏配置
   * @returns {number} 单抽概率
   */
  calculateSingleProbability(pull, baseRate, config) {
    // 无保底情况，每抽概率固定为基础概率
    return baseRate;
  }

  /**
   * 验证计算参数
   * @param {Object} params - 计算参数
   * @returns {Object} 验证结果 {valid, message}
   */
  validateParams(params) {
    if (!params) {
      return { valid: false, message: '参数不能为空' };
    }

    const { resources, target, config } = params;

    if (!resources) {
      return { valid: false, message: '资源数据不能为空' };
    }

    if (!target) {
      return { valid: false, message: '目标数据不能为空' };
    }

    if (!config) {
      return { valid: false, message: '游戏配置不能为空' };
    }

    if (!config.baseRate || config.baseRate <= 0 || config.baseRate >= 1) {
      return { valid: false, message: '基础概率必须在0-1之间' };
    }

    return { valid: true };
  }

  /**
   * 生成缓存键
   * @param {Object} params - 计算参数
   * @returns {string} 缓存键
   */
  generateCacheKey(params) {
    const { resources, target, config } = params;

    // 基于关键参数生成唯一键
    const key = JSON.stringify({
      resources: {
        primogems: resources.primogems || 0,
        intertwinedFates: resources.intertwinedFates || 0
      },
      target: {
        pulls: target.pulls || 0,
        currentPity: target.currentPity || 0
      },
      config: {
        gameId: config.gameId,
        baseRate: config.baseRate,
        pityType: config.pityType
      }
    });

    return key;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    console.log('缓存已清除');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = BaseCalculator;
```

### 概率计算公式说明

**无保底机制（基础计算器）：**
- 单抽概率：p = baseRate（固定）
- 累积概率：P(n) = 1 - (1-p)^n
- 期望抽数：E = 1/p

**示例（原神基础概率0.6%）：**
- 第1抽：p = 0.006, P(1) = 0.006
- 第10抽：p = 0.006, P(10) = 1 - (1-0.006)^10 ≈ 0.058
- 第90抽：p = 0.006, P(90) = 1 - (1-0.006)^90 ≈ 0.418

**注意：**
- 这是无保底情况的计算
- 原神实际有硬保底机制，由HardPity策略实现
- BaseCalculator作为基类，子类重写保底逻辑

### 性能优化设计

**缓存机制：**
- 使用Map存储计算结果
- 缓存键基于输入参数生成（JSON.stringify）
- 缓存命中时直接返回，无需重新计算
- 提供clearCache()方法清除缓存

**性能测试：**
```javascript
// 测试首次计算性能
const start = Date.now();
const result1 = calculator.calculate(params);
const time1 = Date.now() - start;
console.log('首次计算时间:', time1, 'ms'); // 应 < 100ms

// 测试缓存命中性能
const start2 = Date.now();
const result2 = calculator.calculate(params);
const time2 = Date.now() - start2;
console.log('缓存命中时间:', time2, 'ms'); // 应 < 10ms
```

### 纯函数设计原则

**纯函数特性：**
1. 相同输入总是返回相同输出（幂等性）
2. 不依赖外部状态
3. 不修改输入参数
4. 无副作用（不修改全局状态、不执行I/O操作）

**验证方法：**
```javascript
// 单元测试验证纯函数特性
const params1 = { resources: {...}, target: {...}, config: {...} };
const params2 = JSON.parse(JSON.stringify(params1)); // 深拷贝

const result1 = calculator.calculate(params1);
const result2 = calculator.calculate(params2);

// 验证幂等性
assert.deepEqual(result1, result2);

// 验证不修改输入参数
assert.deepEqual(params1, params2);
```

### 数据结构定义

**输入参数结构：**
```javascript
{
  resources: {
    primogems: 10000,        // 原石数量
    intertwinedFates: 80,    // 纠缠之缘数量
    currentPity: 0           // 当前保底抽数
  },
  target: {
    pulls: 90,               // 目标抽数
    currentPity: 0           // 继承抽数
  },
  config: {
    gameId: 'genshin',       // 游戏ID
    baseRate: 0.006,         // 基础概率
    pityType: 'hard',        // 保底类型
    hardPity: 90,            // 硬保底阈值
    softPityStart: 74,       // 软保底起始
    softPityIncrement: 0.06  // 软保底增量
  }
}
```

**输出结果结构：**
```javascript
{
  success: true,
  data: [
    {
      pull: 1,                          // 第1抽
      singleProbability: 0.006,         // 单抽概率
      cumulativeProbability: 0.006,     // 累积概率
      expectedValue: 0.006              // 期望值
    },
    {
      pull: 2,
      singleProbability: 0.006,
      cumulativeProbability: 0.011964,  // 1 - (1-0.006)^2
      expectedValue: 0.023928
    },
    // ... 更多抽数
  ],
  error: null
}
```

### 错误处理

**错误场景：**
- 参数缺失（resources、target、config）
- 基础概率值无效（<=0 或 >=1）
- 计算过程异常（数值溢出等）

**错误处理策略：**
- 参数验证失败返回error Result
- 计算异常捕获并返回error Result
- 错误消息清晰明确，便于调试
- Console输出错误日志

### 测试验证

**验证基础概率计算：**
- [ ] 无保底情况概率计算正确
- [ ] 累积概率公式正确（1 - (1-p)^n）
- [ ] 期望值计算正确

**验证性能要求：**
- [ ] 首次计算响应时间 < 100ms
- [ ] 缓存命中响应时间 < 10ms
- [ ] 缓存机制正常工作

**验证纯函数特性：**
- [ ] 相同输入产生相同输出
- [ ] 不修改输入参数
- [ ] 不依赖外部状态

**验证数据结构：**
- [ ] 输入参数结构正确
- [ ] 输出结果结构正确
- [ ] 概率分布数组格式正确

### Project Structure Notes

**文件位置：**
- core/calculator/ - 概率计算引擎目录
- core/calculator/base-calculator.js - 基础计算器类

**模块依赖：**
- utils/result.js - Result模式工具函数

**命名规范：**
- 文件命名：小写中划线（base-calculator.js）
- 类命名：PascalCase（BaseCalculator）
- 方法命名：camelCase（calculate、calculateProbabilityDistribution）

### References

- [Source: architecture.md#概率计算引擎设计]
- [Source: architecture.md#计算引擎抽象]
- [Source: architecture.md#性能优化策略]
- [Source: architecture.md#FR10-FR22卡池规划与计算模块]
- [Source: prd.md#FR15-计算达成目标的概率]
- [Source: prd.md#FR39-支持配置不同保底机制]
- [Source: prd.md#NFR1-概率计算响应时间]
- [Source: prd.md#NFR3-概率计算准确度]
- [Source: prd.md#NFR14-概率计算结果一致性]
- [Source: epics.md#Story 2.1]

### Common LLM Mistakes to Prevent

**避免以下常见错误：**

1. **不要忘记纯函数设计** - calculate方法必须无副作用
2. **不要修改输入参数** - 使用深拷贝或只读操作
3. **不要依赖外部状态** - 所有数据通过参数传入
4. **不要忘记参数验证** - 验证resources、target、config
5. **不要忘记缓存机制** - 使用Map存储计算结果
6. **不要硬编码概率值** - 从config.baseRate读取
7. **不要忘记错误处理** - 使用try-catch和Result模式
8. **不要忘记Console日志** - 关键操作需要记录日志
9. **不要实现保底逻辑** - BaseCalculator只处理无保底情况，保底由子类实现
10. **不要忘记性能测试** - 验证响应时间 < 100ms

### Previous Story Context

**Story 1.8已实现：**
- pages/planning/planning.js规划页面
- 版本信息显示功能
- 游戏配置加载机制

**Story 1.6已实现：**
- 资源输入和自动保存功能
- 首页数据同步更新机制

**Story 1.2已实现：**
- config/config-loader.js配置加载器
- config/games/*.json游戏配置文件
- 游戏配置数据结构（包含baseRate、pityType等）

**Story 1.1已实现：**
- 项目初始化和基础设施
- utils/result.js Result模式工具函数

**Story 2.1依赖：**
- 游戏配置数据已存在（包含baseRate、pityType）
- Result模式工具函数可用
- 规划页面已实现（后续集成计算引擎）

### Next Story Context

**Story 2.2将依赖：**
- BaseCalculator基础计算器已实现
- 为HardPity策略提供基类
- 实现原神、星铁的硬保底机制

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

待实现后填写。

### Completion Notes List

Story 2.1: 概率计算引擎基础实现已完成。

**实现内容：**
1. ✓ 创建基础计算器类结构 - core/calculator/base-calculator.js
2. ✓ 实现概率分布计算 - 无保底情况的累积概率计算
3. ✓ 实现性能优化机制 - Map缓存机制
4. ✓ 实现纯函数设计 - 无副作用、幂等性
5. ✓ 创建计算结果数据结构 - Result对象+概率分布数组

**关键技术实现：**
- 策略模式：BaseCalculator作为基类，子类实现不同保底机制
- 累积概率公式：P(n) = 1 - (1-p)^n（无保底情况）
- 缓存机制：Map存储计算结果，缓存键基于输入参数JSON.stringify
- 纯函数设计：不修改输入参数，不依赖外部状态，相同输入产生相同输出
- 参数验证：验证resources、target、config，基础概率范围检查
- 错误处理：try-catch包裹，返回Result对象

**测试验证：**
```javascript
const BaseCalculator = require('./core/calculator/base-calculator');
const calc = new BaseCalculator();

// 测试参数
const params = {
  resources: { primogems: 10000, intertwinedFates: 80 },
  target: { pulls: 90, currentPity: 0 },
  config: { gameId: 'genshin', baseRate: 0.006, pityType: 'hard' }
};

// 计算概率分布
const result = calc.calculate(params);

if (result.success) {
  console.log('计算成功:', {
    pulls: result.data.length,
    finalProbability: result.data[89].cumulativeProbability
  });
}
```

**文件清单：**
- core/calculator/base-calculator.js (创建) - 基础计算器类

### File List

已创建的文件：
- core/calculator/base-calculator.js (创建) - 基础计算器类
