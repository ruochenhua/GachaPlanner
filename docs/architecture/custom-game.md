# 自定义游戏指南

本文档说明如何添加自定义游戏模板，支持未收录的游戏。

## 自定义模板接口

### 数据结构

```typescript
interface CustomGameTemplate {
  id: string;                    // 模板ID
  name: string;                  // 游戏名称
  createdAt: number;             // 创建时间
  
  pityConfig: PityConfig;        // 保底配置
  probabilityConfig: ProbabilityConfig; // 概率配置
  resourceConfig: ResourceConfig; // 资源配置
  
  isActive: boolean;             // 是否启用
  isValidated: boolean;          // 是否已验证
}

interface PityConfig {
  type: 'hard' | 'soft' | 'none'; // 保底类型
  hardPity?: number;             // 硬保底阈值
  softPityStart?: number;        // 软保底起始抽数
  softPityRate?: number;         // 每抽概率提升
  inheritance: boolean;          // 保底是否继承
}

interface ProbabilityConfig {
  baseRate: number;              // 基础概率（0-1）
  upMechanism: boolean;          // 是否有UP机制
  upRate?: number;               // UP概率（如有UP）
}

interface ResourceConfig {
  primaryResource: ResourceDefinition;
  secondaryResource?: ResourceDefinition;
}

interface ResourceDefinition {
  id: string;                    // 资源ID
  name: string;                  // 资源名称
  convertRate: number;           // 资源转换率
}
```

## 创建自定义游戏

### 步骤 1：定义游戏参数

确定游戏的关键参数：

1. **保底类型** - 是否有保底机制？硬保底、软保底还是无保底？
2. **基础概率** - 单抽获得目标的基础概率是多少？
3. **保底参数** - 如果有保底，保底阈值是多少？
4. **资源类型** - 游戏使用什么资源进行抽卡？

### 步骤 2：创建模板

```javascript
const template = {
  id: 'custom_fgo',
  name: '命运-冠位指定',
  createdAt: Date.now(),
  
  pityConfig: {
    type: 'none',
    inheritance: false
  },
  
  probabilityConfig: {
    baseRate: 0.01,  // 1%
    upMechanism: false
  },
  
  resourceConfig: {
    primaryResource: {
      id: 'quartz',
      name: '圣晶石',
      convertRate: 3  // 3圣晶石 = 1抽
    }
  },
  
  isActive: true,
  isValidated: true
};
```

### 步骤 3：验证模板

```javascript
const { validateTemplate } = require('../../services/custom-game-service');

const result = validateTemplate(template);

if (result.valid) {
  // 模板验证通过，可以保存
} else {
  console.log('验证失败:', result.errors);
}
```

### 步骤 4：保存模板

```javascript
const customGameService = require('../../services/custom-game-service');

customGameService.saveTemplate(template);
```

## 验证规则

自定义游戏模板需要通过以下验证：

1. **游戏名称** - 不能为空，长度1-50字符
2. **保底类型** - 必须是 hard/soft/none 之一
3. **基础概率** - 必须在 0-1 之间
4. **保底参数** - 必须与保底类型匹配
5. **资源配置** - 至少要有主要资源
6. **资源转换率** - 必须大于 0

## 使用自定义游戏

保存后的自定义游戏会自动添加到游戏列表中，用户可以：

1. 在游戏列表中看到自定义游戏
2. 输入资源数据进行规划
3. 获得概率计算结果

## 注意事项

1. **数据来源** - 自定义游戏的参数需要用户自行核实
2. **计算准确度** - 确保参数正确以获得准确的计算结果
3. **版本管理** - 游戏参数更新时需要手动修改模板
4. **数据备份** - 自定义游戏数据存储在本地，清除数据会丢失

## 示例：添加明日方舟

```javascript
const arknightsTemplate = {
  id: 'custom_arknights',
  name: '明日方舟',
  createdAt: Date.now(),
  
  pityConfig: {
    type: 'soft',
    softPityStart: 50,
    softPityRate: 0.02,
    inheritance: true
  },
  
  probabilityConfig: {
    baseRate: 0.02,  // 2%
    upMechanism: true,
    upRate: 0.5
  },
  
  resourceConfig: {
    primaryResource: {
      id: 'orundum',
      name: '合成玉',
      convertRate: 600  // 600合成玉 = 1抽
    },
    secondaryResource: {
      id: 'headhuntingPermit',
      name: '寻访凭证',
      convertRate: 1
    }
  },
  
  isActive: true,
  isValidated: true
};

customGameService.saveTemplate(arknightsTemplate);
```