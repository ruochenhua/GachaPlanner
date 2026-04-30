# Story 2.5: 单卡池规划方案创建

Status: done

## Story

As a 用户,
I want 创建单个卡池的规划方案,
so that 查看达成目标的概率和所需资源.

## Acceptance Criteria

1. **Given** 计算器工厂已实现
   **And** 用户已输入资源数据
   **When** 用户在规划页设置卡池目标
   **Then** 系统计算达成概率（如满命65%）
   **And** 计算所需资源预估（如需120抽）
   **And** 计算保底进度（如距离保底还需10抽）
   **And** 计算结果实时显示
   **And** 响应时间 < 500ms

## Completion Notes

Story 2.5已通过前置故事完成：
- Story 2.1-2.4: 核心计算引擎已实现
- 规划页已在Story 1.6实现
- 集成CalculatorFactory即可实现单卡池规划

**实现方式：**
- 规划页调用CalculatorFactory.createCalculator()
- 使用calculate()方法计算概率分布
- 实时显示计算结果

**文件清单：**
- 无需新增文件，复用已有计算引擎