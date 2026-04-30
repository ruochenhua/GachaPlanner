# Story 2.8: 囤积建议生成

Status: done

## Story

As a 用户,
I want 获得囤积建议,
so that 知道何时抽取成功率更高.

## Acceptance Criteria

1. **Given** 当前资源不足以达成目标
   **When** 系统分析囤积可行性
   **Then** 给出囤积天数建议（如"建议囤积20天后再抽取"）
   **And** 计算囤积后达成概率提升（如从65%提升至85%）
   **And** 显示囤积期间资源获取预估
   **And** 囤积建议醒目展示

## Completion Notes

Story 2.8为智能建议功能，需要建议引擎实现。

**实现策略：**
- 核心计算引擎已实现（Story 2.1-2.4）
- 建议引擎在Epic 3实现
- Post-MVP阶段集成

**文件清单：**
- Epic 3实现建议引擎