<!--
Sync Impact Report
- Version change: template → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → 全栈 Next.js 架构优先
  - [PRINCIPLE_2_NAME] → Tailwind + 组件库一致设计系统
  - [PRINCIPLE_3_NAME] → Prisma + Supabase 为单一数据源
  - [PRINCIPLE_4_NAME] → arXiv 数据获取与缓存规范
  - [PRINCIPLE_5_NAME] → 可观测性与质量保障
- Added sections:
  - 技术与架构约束
  - 开发流程与质量门禁
- Removed sections:
  - 占位模板示例注释
- Templates requiring updates (✓ reviewed / no structural changes needed):
  - ✓ .specify/templates/plan-template.md（继续在 Constitution Check 中引用本宪章，不需改动）
  - ✓ .specify/templates/spec-template.md（与技术栈无强耦合，无需更新）
  - ✓ .specify/templates/tasks-template.md（阶段/故事结构与本宪章开发流程保持一致）
  - ✓ .specify/templates/agent-file-template.md（仅为运行时指南聚合，无需结构性调整）
  - ✓ .specify/templates/checklist-template.md（通用清单模板，无需更新）
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): 需要由维护者填写本宪章首次正式通过的日期（YYYY-MM-DD）
-->

# PaperX Constitution

## Core Principles

### 全栈 Next.js 架构优先

- 前端与后端统一采用 Next.js App Router，所有 Web 界面与 HTTP API 优先实现为 Next.js Route Handlers。
- 所有服务端逻辑（含业务 API、Webhooks、后台任务触发入口）必须通过 Next.js 约定式路由暴露，避免引入额外后端进程，除非有明确的性能或合规理由并在架构文档中记录。
- 所有接口输入输出必须有清晰的 TypeScript 类型定义，并在共享的类型模块中复用（前后端共享 DTO/Schema）。
- 面向 arXiv 的调用能力必须封装为可复用的 domain/service 层（如 `lib/arxiv/`），UI 层和 API Route 不得直接拼装 HTTP 请求。

**Rationale**: 统一在 Next.js 全栈框架中实现前后端逻辑，降低架构复杂度，增强类型安全与可维护性，并简化部署与运行时运维成本。

### Tailwind + 组件库一致设计系统

- UI 必须使用 Tailwind CSS 作为基础样式工具，并在项目中定义统一的设计 Token（颜色、间距、排版、阴影等），禁止在组件中散落魔法数样式。
- 组件库必须在 Shadcn/UI 与 Mantine 之间作出**单一选择**作为主库；除迁移或 POC 外，同一时间不得混用两个组件库实现正式页面。
- 所有业务页面应基于一组设计系统级别的基础组件（如 Layout、Form、Button、Card 等）构建，避免各处重复实现相似 UI。
- UI 交互必须优先兼顾可访问性（语义标签、ARIA、键盘可用性）及响应式布局，移动端浏览体验不得明显劣于桌面端。

**Rationale**: 通过 Tailwind + 单一组件库建立统一的设计系统，提高开发效率和视觉一致性，并在不牺牲可访问性的前提下快速迭代。

### Prisma + Supabase 为单一数据源

- 所有持久化业务数据必须通过 Prisma ORM 访问 Supabase（PostgreSQL），不得绕过 Prisma 直接对数据库执行 SQL 操作，除非为只读运维脚本且记录在案。
- 所有数据库变更必须通过 Prisma migration 管理，禁止在生产环境直接手写 schema 变更。
- 数据模型必须围绕“论文/文献”核心域建模（如 Paper、Author、UserLibrary、Tag、Source 等），并清晰区分从 arXiv 同步的只读字段与本地扩展字段。
- 与 Supabase 其他能力（如存储桶、Edge Functions）集成时，必须在架构层明确边界，确保应用仍以 Prisma + Postgres 为事实真相源（source of truth）。

**Rationale**: 使用 Prisma + Supabase 作为统一数据访问层，提升类型安全与迁移可控性，并为未来多环境、多区域部署打好基础。

### arXiv 数据获取与缓存规范

- 所有对 arXiv API 的访问必须通过集中封装模块（如 `lib/arxiv/client.ts`），统一处理速率限制、错误重试和日志记录，不允许在任意组件中散落 HTTP 请求。
- 从 arXiv 获取的元数据和 PDF 链接必须缓存到自有存储（Supabase 数据库及/或对象存储），客户端展示尽量读取本地缓存，避免对 arXiv 产生不必要的重复请求。
- 缓存策略必须显式定义（如基于 `updated_at` 字段的刷新、TTL、强制刷新入口），并在文档中说明刷新行为可能对用户体验的影响。
- 在无法访问 arXiv 或达到速率限制时，系统必须提供可用的降级体验（使用缓存、提示稍后重试等），而非直接导致页面或流程失败。

**Rationale**: 在尊重 arXiv 使用政策和可用性的前提下，通过本地缓存提升响应性能、减少失败率，并保障长期可维护性。

### 可观测性与质量保障

- 所有关键业务流程（如检索、收藏、同步、导出）必须具备可观测性：包括结构化日志、基础性能指标（延迟、错误率）、关键操作的审计记录。
- 代码必须保持 TypeScript 严格模式，新增模块需要具备最小可行测试（单元测试或集成测试）或可重复的手动验证步骤说明。
- 错误处理必须显式：前端提供友好错误消息，后端统一错误包装并记录上下文信息，不允许静默失败或吞异常。
- 性能与成本必须在设计阶段考虑：涉及大批量抓取、批处理、批量导入导出等功能，必须给出合理的分页/限流方案并在文档中记录假设。

**Rationale**: 通过可观测性和质量基线保证系统在扩展功能、增加用户和请求量时依然稳定可靠。


## 技术与架构约束

### 技术栈约束

- 前端框架必须使用 Next.js（App Router），禁止引入与其冲突的路由或渲染框架。
- 样式层必须基于 Tailwind CSS；如需编写自定义 CSS，应限于全局主题和少量抽象组件，不得在页面中混入大量散落的 CSS 文件。
- UI 组件库必须统一选择 Shadcn/UI 或 Mantine 中的一个作为主组件库，并在架构或 README 中记录选择与理由。
- 后端 API 必须通过 Next.js API Routes / Route Handlers 暴露；如确有必要引入独立后端服务，必须在架构文档中说明拆分边界和调用方式。

### 数据与存储约束

- 所有结构化业务数据必须存储在 Supabase PostgreSQL 中，并通过 Prisma Schema 定义与访问。
- 迁移必须通过 Prisma 官方工具生成和应用，所有迁移文件需要纳入版本管理并作为 CI 检查的一部分。
- 从 arXiv 同步的 PDF 或其他大文件若需缓存，必须使用 Supabase Storage 或明确指定的对象存储服务，并在代码中显式区分元数据表与文件存储。
- 对于用户隐私相关数据（如个人笔记、标注等），必须采用最小化存储原则，仅保留业务上必需字段，并提供数据删除/导出能力的扩展空间。

### 安全与合规约束

- 所有对 Supabase 的访问必须使用服务端安全凭证，禁止在浏览器端泄露具有高权限的密钥。
- 认证与授权策略必须统一定义（例如使用 Supabase Auth 或自建 auth 服务），并在 API 层进行权限校验，禁止将安全逻辑仅放在前端。
- 调用 arXiv API 时不得绕过其使用条款，禁止批量抓取与缓存超过合理范围的内容；如未来有批量任务，必须评估并限制速率。
- 必须遵守基础的安全防护措施：防止 XSS/CSRF/SQL 注入、敏感配置通过环境变量注入等。

### 性能与成本约束

- 所有涉及远程调用（arXiv、Supabase）和大数据量操作的功能必须在设计阶段给出估算：单次调用数据量、预计频次、缓存命中率目标。
- 列表与检索页面必须实现分页或增量加载；禁止一次性加载超大数量结果到浏览器。
- 对于高频调用的 API 必须监控延迟与错误率，必要时通过缓存、中间表或异步任务进行优化。


## 开发流程与质量门禁

### 阶段与文档

- 每个功能必须通过 `/speckit.specify`、`/speckit.plan`、`/speckit.tasks` 等命令生成规范化的 spec、plan、tasks 文档。
- `spec.md` 负责业务与用户视角的需求描述，不得包含技术实现细节或具体技术栈选择。
- `plan.md` 必须明确本功能在本文档所述技术栈下的技术实现策略（Next.js App Router、Prisma、Supabase、arXiv 缓存等）。
- `tasks.md` 必须按照用户故事组织任务，确保每个故事可以独立实现和验证。

### Constitution Check（宪章检查）

- 在规划阶段，`plan.md` 中的 **Constitution Check** 部分必须显式记录本功能与本宪章各原则/约束的一致性。
- 如有违反或例外（例如临时使用其他存储、引入额外后端服务），必须在 `plan.md` 中记录：
  - 违反的原则条目；
  - 例外的必要性说明；
  - 预计影响范围与回滚方案；
  - 计划在后续迭代中消除例外的路径。
- 任何未通过宪章检查的计划，不得进入实现阶段，除非获得维护者明确书面批准。

### 代码评审与质量门禁

- 所有非琐碎变更必须经过代码评审（Code Review），评审责任包括但不限于：
  - 是否遵守本宪章各项技术栈与架构约束；
  - 是否保持 Next.js 全栈架构的一致性；
  - 是否正确使用 Prisma + Supabase 和 arXiv 缓存模块；
  - 是否满足最小可用测试或验证步骤要求。
- PR 必须链接对应的 `spec.md` / `plan.md` / `tasks.md`，并在描述中说明本次变更影响的用户故事和域模型。
- 在合并前必须通过：
  - 类型检查；
  - 基础自动化测试（如有）；
  - 必要的手动回归步骤（在缺乏自动化测试时需在 PR 中说明）。


## Governance

- 本宪章是 PaperX 项目在架构与流程层面的最高约束文件，对与之冲突的局部约定或临时实践具有优先权。
- 任何影响技术栈选择、核心架构、数据治理或开发流程的决定，均必须在本宪章中有所体现；否则视为临时性实验，不得大规模推广。

### 修订流程

- 对本宪章的修改必须通过 Pull Request 完成，并在 PR 描述中说明：
  - 修改原因（问题、机会或外部约束）；
  - 受影响的原则或章节；
  - 对现有功能与团队流程的影响评估；
  - 所需迁移或过渡步骤。
- 宪章版本号采用语义化版本（MAJOR.MINOR.PATCH）：
  - **MAJOR**：删除或实质性重定义原则，导致既有实践需要大规模调整。
  - **MINOR**：新增原则或显著扩展某些指导，可能需要增量调整实践。
  - **PATCH**：措辞澄清、排版或非语义性微调，不改变现有实践的合规结论。
- 每次合并修改宪章必须更新：
  - 本文件底部的版本号与最近修订日期；
  - 文件顶部的 Sync Impact Report，简要说明变更范围和需同步的模板或文档。

### 宪章合规审查

- 至少每季度应进行一次宪章合规自查，检查：
  - 实际技术栈与本宪章记录是否一致；
  - 新增功能是否在 `plan.md` 中完成了 Constitution Check；
  - 是否存在长期未解决的“临时例外”实践。
- 发现不合规项时，应在近期迭代中创建明确的改进任务或正式修订本宪章，避免长期悬而不决。


**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-04

# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
