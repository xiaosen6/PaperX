---

description: "Task list for PaperX 官网与论文推送首页"
---

# Tasks: PaperX 官网与论文推送首页

**Input**: Design documents from `/specs/1-paperx-landing/`  
**Prerequisites**: `plan.md`（已完成）, `spec.md`（已完成）, 后续可补充 `research.md`, `data-model.md`, `contracts/`

**Tests**: 当前不强制 TDD，但建议为关键领域服务和 API 编写基础测试。测试任务在相关阶段标注为可选。  

**Organization**: 任务按用户故事分组，确保每个故事可以独立实现与验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可与其他 [P] 任务并行执行（不同文件、无直接依赖）
- **[Story]**: 归属的用户故事（US1, US2, US3, US4）
- 所有描述中应包含明确的文件路径

## Path Conventions

- 单项目 Next.js：`app/`, `lib/`, `components/`, `prisma/`, `tests/`
- API 路由：`app/api/.../route.ts`
- 领域服务：`lib/<domain>/...`

---

## Phase 1: Setup（项目初始化）

**Purpose**: 建立符合宪章要求的基础项目结构与依赖。

- [ ] T001 创建基础目录结构（若尚未存在），包括 `app/`, `lib/`, `components/`, `prisma/`, `tests/`  
- [ ] T002 [P] 初始化 Tailwind CSS 并配置基础主题，在 `tailwind.config.ts` 与 `app/globals.css` 中设置设计 Token  
- [ ] T003 [P] 引入并配置 Shadcn UI，在 `components/ui/` 生成基础组件集（Button, Input, Card 等）  
- [ ] T004 配置 TypeScript 严格模式与基础别名，在 `tsconfig.json` 中设置 `baseUrl` 和 `paths`（如 `@/lib/*`）  
- [ ] T005 初始化 Prisma，在 `prisma/schema.prisma` 中定义基础数据源并指向 `DATABASE_URL` 环境变量  
- [ ] T006 配置 Supabase 环境变量与客户端初始化，在 `.env.local` 中设置 `DATABASE_URL`，并在 `lib/supabase/client.ts` 中创建客户端封装  
- [ ] T007 [P] 配置基础 ESLint/Prettier 与 Husky（可选），在根目录添加 `.eslintrc.*`, `.prettierrc` 等  

---

## Phase 2: Foundational（所有用户故事的前置能力）

**Purpose**: 所有用户故事开始前必须完成的核心基础设施。

**⚠️ CRITICAL**: 未完成本阶段前，禁止开始任何 US1–US4 实现。

- [ ] T008 设计并在 `prisma/schema.prisma` 中定义核心实体（Paper, UserLibrary, ModelProviderConfig 等的初版字段）  
- [ ] T009 运行 `npx prisma migrate dev` 生成与应用初始迁移，在 `prisma/migrations/` 中验证结果  
- [ ] T010 [P] 在 `lib/arxiv/client.ts` 中实现 arXiv API 客户端骨架（含请求封装、错误处理与简单限流接口）  
- [ ] T011 [P] 在 `lib/papers/service.ts` 中实现基础论文查询与映射接口（从数据库与 arXiv 客户端读取）  
- [ ] T012 在 `app/layout.tsx` 与 `components/layout/` 下实现基础布局（导航栏、页脚、主题），包含首页、我的文库、推荐、设置的导航入口  
- [ ] T013 [P] 配置日志与错误处理基础设施，在 `lib/observability/logger.ts` 和全局错误边界中添加结构化日志与错误捕获  
- [ ] T014 在 `tests/unit/` 下为 `lib/arxiv/client.ts` 与 `lib/papers/service.ts` 添加最小单元测试骨架（可后续补充断言）  

---

## Phase 3: User Story 1 - 浏览最新热门论文流 (Priority: P1) 🎯 MVP

**Goal**: 提供类似 alphaXiv 的 PaperX 首页，展示最新/热门论文流，支持基础筛选与详情查看。  
**Independent Test**: 仅实现本阶段后，未登录用户即可打开首页、看到论文列表、应用筛选并查看单篇详情。

### Implementation for User Story 1

- [ ] T015 [P] [US1] 在 `prisma/schema.prisma` 中完善 `Paper` 模型字段（标题、作者、摘要、发布日期、标签、来源、外部链接等），并迁移数据库  
- [ ] T016 [P] [US1] 在 `lib/arxiv/mappers.ts` 中实现 arXiv 响应到 `Paper` 实体的映射函数  
- [ ] T017 [US1] 在 `lib/arxiv/client.ts` 中实现获取最新/热门论文列表的具体方法（含分页与简单筛选参数）  
- [ ] T018 [US1] 在 `lib/papers/service.ts` 中实现首页论文流服务：优先读取数据库缓存，必要时回源 arXiv 并刷新缓存  
- [ ] T019 [P] [US1] 在 `app/api/papers/route.ts` 中实现 GET 接口，支持按时间/标签请求论文列表，并返回分页结果  
- [ ] T020 [P] [US1] 在 `components/papers/PaperCard.tsx` 中实现论文卡片组件，展示标题、作者、发布日期与摘要片段  
- [ ] T021 [US1] 在 `components/papers/FiltersBar.tsx` 中实现基础筛选组件（时间范围、主题/标签选择）  
- [ ] T022 [US1] 在 `app/page.tsx` 中实现首页页面：调用 `/api/papers`，渲染论文流与筛选条，处理加载与空状态  
- [ ] T023 [US1] 在 `app/paper/[id]/page.tsx` 中实现论文详情页面：根据 ID 调用 `/api/papers/[id]` 或对应服务，展示完整信息与跳转链接  
- [ ] T024 [P] [US1] 在 `tests/integration/home-feed.test.ts` 中添加集成测试（或手动用例说明），覆盖首页加载、筛选、空结果等场景  

**Checkpoint**: 完成本阶段后，应可向用户演示“访问首页 → 浏览与筛选论文 → 打开详情”的完整流程。

---

## Phase 4: User Story 2 - 收藏和管理个人论文列表 (Priority: P2)

**Goal**: 登录用户可以收藏论文并在“我的文库”中查看与管理。  
**Independent Test**: 在已有首页浏览能力的前提下，仅实现本阶段即可完成收藏/取消收藏与文库浏览。

### Implementation for User Story 2

- [ ] T025 [P] [US2] 在 `prisma/schema.prisma` 中定义 `UserLibrary` / `UserPaper` 关系模型，并迁移数据库  
- [ ] T026 [US2] 在 `lib/library/service.ts` 中实现添加收藏、取消收藏和按用户查询收藏列表的服务函数  
- [ ] T027 [P] [US2] 在 `app/api/library/route.ts` 中实现 POST/DELETE/GET 接口，处理收藏/取消收藏与列表查询（基于当前登录用户）  
- [ ] T028 [P] [US2] 在 `components/papers/FavoriteButton.tsx` 中实现收藏按钮组件，支持加载与错误状态  
- [ ] T029 [US2] 在 `app/(user)/library/page.tsx` 中实现“我的文库”页面，展示收藏论文列表并支持基础排序  
- [ ] T030 [US2] 在 `lib/observability/logger.ts` 中为收藏/取消收藏操作增加结构化日志与审计信息  
- [ ] T031 [P] [US2] 在 `tests/integration/library-flow.test.ts` 中添加基础集成测试（或手动用例说明），覆盖收藏与取消收藏流程  

**Checkpoint**: 用户可以登录、收藏论文并在“我的文库”中查看和管理收藏记录。

---

## Phase 5: User Story 3 - 个性化论文推荐与推送视图 (Priority: P3)

**Goal**: 提供基于用户行为与偏好的推荐论文视图，与通用热门列表可区分。  
**Independent Test**: 在已有首页与文库能力基础上，仅实现本阶段即可向用户展示“为你推荐”的论文流。

### Implementation for User Story 3

- [ ] T032 [P] [US3] 在 `prisma/schema.prisma` 中补充与推荐相关的辅助字段（如简单的兴趣标签或权重），并迁移数据库  
- [ ] T033 [US3] 在 `lib/recommend/service.ts` 中实现初版推荐策略（基于浏览/收藏历史的简单启发式），并预留后续模型接入扩展点  
- [ ] T034 [P] [US3] 在 `app/api/recommend/route.ts` 中实现 GET 接口，返回当前用户的推荐论文列表  
- [ ] T035 [US3] 在 `app/(recommend)/page.tsx` 中实现“为你推荐”页面，支持加载推荐流并与通用热门列表区分展示  
- [ ] T036 [US3] 在 `lib/recommend/service.ts` 中记录推荐命中与用户互动（点击/收藏）事件，用于后续调优  
- [ ] T037 [P] [US3] 在 `tests/integration/recommend-feed.test.ts` 中补充测试或手动用例，验证推荐列表加载与基本行为记录  

**Checkpoint**: 登录用户在“为你推荐”视图中可看到与通用热门不同的推荐列表，并能正常交互。

---

## Phase 6: User Story 4 - 配置自定义模型服务商 (Priority: P3)

**Goal**: 在网站设置中配置模型服务商信息，为后续智能功能（摘要、推荐调优等）提供统一配置入口。  
**Independent Test**: 管理员可新增/编辑/禁用模型服务商配置，并在其他模块中读取这些配置。

### Implementation for User Story 4

- [ ] T038 [P] [US4] 在 `prisma/schema.prisma` 中定义 `ModelProviderConfig` 模型（名称、说明、类型、端点、密钥占位等），并迁移数据库  
- [ ] T039 [US4] 在 `lib/settings/model-providers/service.ts` 中实现模型服务商配置的 CRUD 服务，确保敏感信息只在服务层处理  
- [ ] T040 [P] [US4] 在 `app/api/settings/model-providers/route.ts` 中实现配置管理 API（仅限管理员或高权限用户访问）  
- [ ] T041 [P] [US4] 在 `components/settings/ModelProviderForm.tsx` 中实现创建/编辑表单组件，隐藏敏感字段实际值，仅显示占位符  
- [ ] T042 [US4] 在 `app/(settings)/model-providers/page.tsx` 中实现设置页面：列表展示、创建/编辑/禁用操作与状态提示  
- [ ] T043 [US4] 在 `lib/observability/logger.ts` 中为模型服务商配置变更添加审计日志（不记录明文密钥）  
- [ ] T044 [P] [US4] 在 `tests/integration/model-providers-settings.test.ts` 中添加基础测试或手动用例，验证配置管理流程  

**Checkpoint**: 系统具备统一的模型服务商配置入口与安全存储/读取机制，可被后续智能功能使用。

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: 涉及多个用户故事的横切改进与完善。

- [ ] T045 [P] 完善首页、文库、推荐与设置页面的空状态与错误提示文案，在 `components/` 中统一空状态组件  
- [ ] T046 [P] 补充性能优化，如为首页与推荐列表配置缓存策略或增量加载逻辑，在 `lib/papers/service.ts` 与 `lib/recommend/service.ts` 中实现  
- [ ] T047 [P] 在 `docs/` 或 `specs/1-paperx-landing/quickstart.md` 中编写快速上手说明（运行、配置 Supabase、演示关键流程）  
- [ ] T048 在 `tests/e2e/` 下添加端到端测试（或详细手动测试脚本），覆盖首页浏览、收藏、推荐与设置页访问的完整路径  
- [ ] T049 代码清理与重构：统一日志与错误处理模式，去除重复逻辑，确保域服务边界清晰  

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始  
- **Foundational (Phase 2)**: 依赖 Setup 完成 —— 阻塞所有用户故事  
- **User Story Phases (3–6)**: 均依赖 Foundational 完成后方可开始  
  - US1 (首页论文流) 是后续故事的基础，应优先完成  
  - US2（文库）与 US3（推荐）在 US1 完成后可并行推进  
  - US4（模型服务商设置）可与 US3 并行，但不阻塞 US1/US2 MVP  
- **Polish (Final Phase)**: 在所有目标用户故事完成后执行

### User Story Dependencies

- **User Story 1 (US1)**: 无其他用户故事依赖，是 MVP 的基础  
- **User Story 2 (US2)**: 依赖 US1 已提供稳定的论文实体与展示能力  
- **User Story 3 (US3)**: 依赖 US1/US2 提供的论文与用户行为数据  
- **User Story 4 (US4)**: 逻辑上独立于 US1–US3，可在 Foundational 完成后独立推进，但其价值在于支撑后续智能能力

### Within Each User Story

- 优先完成领域模型与服务层，再实现 API 路由，最后构建页面与组件。  
- 如添加测试：先写测试骨架或用例描述，再实现功能逻辑。  
- 每个用户故事完成后，应能独立演示与验证，不依赖后续故事。

### Parallel Opportunities

- Setup 与 Foundational 中标记为 `[P]` 的任务可在不同成员之间并行拆分（例如 T002/T003/T007/T010/T011 等）。  
- 用户故事阶段中 `[P]` 任务（如组件实现与 API 路由）可在约定接口后并行推进。  
- US2、US3、US4 可以在 US1 完成后根据团队人数并行开发。

---

## Implementation Strategy

### MVP First（先完成 US1）

1. 完成 Phase 1: Setup  
2. 完成 Phase 2: Foundational（关键阻塞）  
3. 完成 Phase 3: User Story 1（首页论文流）  
4. 停下验证：通过手动或自动测试验证首页体验，确保稳定后再继续  

### Incremental Delivery（增量交付）

1. 在 MVP 稳定后依次增加 US2（文库）与 US3（推荐），每个故事完成后都可单独发布和演示  
2. US4（模型服务商设置）可在 US3 前后任一时点实现，不影响核心阅读与收藏体验  
3. 最后执行 Polish 阶段，统一性能、体验与文档

### Team Parallelization（多人并行协作）

- 一人主导基础设施与 US1（列表与详情）；  
- 另一人负责 US2（文库）与部分 US3 推荐逻辑；  
- 第三人可专注 US4（模型服务商设置）与可观测性/审计日志；  
- 所有成员在最后一轮共同处理 Polish 阶段任务。  


