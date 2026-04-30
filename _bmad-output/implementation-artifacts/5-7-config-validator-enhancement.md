# Story 5.7: 配置验证器完善

Status: ready-for-dev

## Story

As a 系统,
I want 完善的配置验证器,
So that 确保游戏配置数据完整正确.

## Acceptance Criteria

**Given** 配置验证器已初步实现
**When** 完善配置验证器
**Then** 验证必填字段存在（gameId, name, pityType等）
**And** 验证字段类型正确（number, string, boolean）
**And** 验证数值范围合理（如基础概率0-1之间）
**And** 验证保底参数逻辑正确（如硬保底阈值>0）
**And** 验证失败返回具体错误信息
**And** 验证成功返回配置对象

## Tasks / Subtasks

- [ ] **Task 1: 完善必填字段验证** (AC: 1)
  - [ ] 1.1 定义必填字段列表
  - [ ] 1.2 验证gameId存在且非空
  - [ ] 1.3 验证name存在且非空
  - [ ] 1.4 验证pityType存在且有效
  - [ ] 1.5 验证version和updatedAt存在

- [ ] **Task 2: 完善类型验证** (AC: 2)
  - [ ] 2.1 验证字符串字段类型
  - [ ] 2.2 验证数值字段类型
  - [ ] 2.3 验证布尔字段类型
  - [ ] 2.4 验证对象字段类型
  - [ ] 2.5 验证数组字段类型

- [ ] **Task 3: 完善数值范围验证** (AC: 3)
  - [ ] 3.1 验证基础概率范围（0-1）
  - [ ] 3.2 验证保底阈值范围（>0）
  - [ ] 3.3 验证资源转换率范围（>0）
  - [ ] 3.4 验证软保底参数范围
  - [ ] 3.5 验证其他数值参数范围

- [ ] **Task 4: 完善逻辑验证** (AC: 4)
  - [ ] 4.1 硬保底必须有hardPity字段
  - [ ] 4.2 软保底必须有softPityStart和softPityRate
  - [ ] 4.3 无保底不能有保底参数
  - [ ] 4.4 继承规则必须为布尔值
  - [ ] 4.5 UP机制参数逻辑验证

- [ ] **Task 5: 完善错误信息** (AC: 5, 6)
  - [ ] 5.1 返回具体字段错误
  - [ ] 5.2 返回错误类型描述
  - [ ] 5.3 返回期望值说明
  - [ ] 5.4 支持多条错误汇总
  - [ ] 5.5 验证成功返回配置对象

- [ ] **Task 6: 集成测试** (AC: 1-6)
  - [ ] 6.1 测试必填字段验证
  - [ ] 6.2 测试类型验证
  - [ ] 6.3 测试范围验证
  - [ ] 6.4 测试逻辑验证
  - [ ] 6.5 测试错误信息返回

## Dev Notes

配置验证器完善，确保游戏配置数据完整正确。

### 必填字段列表

```javascript
const REQUIRED_FIELDS = [
  'gameId',     // 游戏ID
  'name',       // 游戏名称
  'pityType',   // 保底类型
  'baseRate',   // 基础概率
  'version',    // 版本号
  'updatedAt',  // 更新日期
  'resources'   // 资源类型
];
```

### 验证规则

```javascript
const VALIDATION_RULES = {
  gameId: {
    type: 'string',
    pattern: /^[a-z0-9-]+$/,
    message: 'gameId必须为小写字母、数字或中划线'
  },
  name: {
    type: 'string',
    minLength: 1,
    maxLength: 50,
    message: '游戏名称长度1-50字符'
  },
  pityType: {
    type: 'string',
    enum: ['hard', 'soft', 'none'],
    message: 'pityType必须为hard/soft/none'
  },
  baseRate: {
    type: 'number',
    min: 0,
    max: 1,
    message: '基础概率必须在0-1之间'
  },
  hardPity: {
    type: 'number',
    min: 1,
    max: 1000,
    condition: (config) => config.pityType === 'hard',
    message: '硬保底阈值必须在1-1000之间'
  },
  softPityStart: {
    type: 'number',
    min: 1,
    condition: (config) => config.pityType === 'soft',
    message: '软保底起始抽数必须>0'
  },
  softPityRate: {
    type: 'number',
    min: 0,
    max: 1,
    condition: (config) => config.pityType === 'soft',
    message: '软保底概率提升率必须在0-1之间'
  }
};
```

### 错误信息格式

```javascript
{
  valid: false,
  errors: [
    {
      field: 'baseRate',
      type: 'range',
      message: '基础概率必须在0-1之间',
      value: 1.5,
      expected: '0-1'
    },
    {
      field: 'hardPity',
      type: 'missing',
      message: '硬保底类型必须提供hardPity参数',
      condition: 'pityType === "hard"'
    }
  ]
}
```

## Dev Agent Record

### Agent Model Used

glm-5

### File List

- core/config/config-validator.js (已在5.1创建) - 配置验证器