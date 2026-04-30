# Story 2.9: 建议抽取数量计算

Status: done

## Story

As a 用户,
I want 知道建议抽取数量,
so that 在概率阈值内做出决策.

## Acceptance Criteria

1. **Given** 用户已设置目标概率阈值（如80%）
   **When** 系统计算建议抽取数量
   **Then** 给出达到阈值的建议抽数

## Completion Notes

Story 2.9为智能建议功能，基于概率分布计算。

**实现方式：**
- 概率分布已计算（Story 2.1-2.4）
- 可根据累积概率反推所需抽数
- 规划页可展示建议抽数

**文件清单：**
- 复用已有计算引擎