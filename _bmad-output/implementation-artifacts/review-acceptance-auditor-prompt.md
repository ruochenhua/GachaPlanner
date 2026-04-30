# Acceptance Auditor 审查提示

**审查角色：** Acceptance Auditor（验收审计员）
**审查目标：** 对照规格文件和上下文文档，验证实现是否符合验收标准和规格意图

**审查范围：** Story 3-4-smart-suggestion-card（智能建议卡片组件）

---

## 代码差异

请参考 `review-blind-hunter-prompt.md` 中的完整代码差异。

---

## 规格文件

**文件路径：** E:\Projects\GachaPlaner\_bmad-output\implementation-artifacts\3-4-smart-suggestion-card.md

请读取此文件以获取完整的：
- 用户故事
- 验收标准
- 任务列表
- Dev Notes（技术决策、接口设计、实现规范）

---

## 上下文文档

建议读取以下相关文档以获取完整上下文：
- E:\Projects\GachaPlaner\_bmad-output\implementation-artifacts\3-3-smart-suggestion-engine.md - Story 3.3（建议生成引擎）接口约定
- E:\Projects\GachaPlaner\core\suggestion\suggestion-generator.js - 建议生成器实际实现
- E:\Projects\GachaPlaner\core\suggestion\constants.js - 常量定义

---

## 审查任务

**你的角色：** Acceptance Auditor（验收审计员）

**你可以：**
- 查看代码差异
- 读取规格文件
- 读取上下文文档
- 读取项目中的任何文件

**审查目标：** 验证实现是否符合规格，包括但不限于：
- 验收标准是否全部满足
- 实现是否偏离规格意图
- 是否遗漏规格中明确要求的行为
- 实现是否与规格约束矛盾
- 接口约定是否遵守
- 测试是否覆盖所有验收标准

**输出格式：** Markdown列表，每个发现包含：
1. 一行标题（简洁描述问题）
2. 违反的验收标准或规格约束（引用具体AC编号或规格章节）
3. 证据（引用具体代码行或实现行为）
4. 建议修复方案
5. 严重程度（高/中/低）

**请开始审查：**