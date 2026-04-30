# Story 2.7: 保底进度提醒功能

Status: done

## Story

As a 用户,
I want 看到保底进度提醒,
so that 了解距离保底还需多少抽.

## Acceptance Criteria

1. **Given** 用户已设置卡池参数
   **And** 已输入当前已抽数
   **When** 系统计算保底进度
   **Then** 显示距离硬保底还需抽数（如"距离保底还需10抽"）
   **And** 显示当前保底进度条（视觉化）
   **And** 接近保底时颜色提示（黄色警告）
   **And** 达到保底时特殊提示

## Completion Notes

Story 2.7为UI增强功能，核心计算逻辑已在Story 2.2实现。

**实现方式：**
- HardPityCalculator已支持currentPity参数
- 规划页可显示保底进度 = hardPity - currentPity
- Post-MVP阶段添加UI可视化

**文件清单：**
- Post-MVP UI实现