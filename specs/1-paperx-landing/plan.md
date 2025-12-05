# Implementation Plan: PaperX 官网与论文推送首页

**Branch**: `1-paperx-landing` | **Date**: 2025-12-04 | **Spec**: `specs/1-paperx-landing/spec.md`  
**Input**: Feature specification from `/specs/1-paperx-landing/spec.md`

## Summary

为 PaperX 创建一个类似 alphaXiv 的官网首页，核心能力包括：  
- 展示最新/热门论文流，支持基础筛选与详情查看；  
- 登录用户的收藏与“我的文库”；  
- 基于行为和偏好的个性化推荐视图；  
- 提供“设置 → 模型服务商”入口，用于配置内部智能能力所依赖的模型服务商。  

实现上采用单体 Next.js（App Router）全栈应用，前端使用 Tailwind CSS + Shadcn UI 建立统一设计系统，后端通过 Next.js Route Handlers + Prisma 访问 Supabase PostgreSQL，并通过专用模块访问 arXiv API，将元数据与 PDF 链接缓存到自有存储。系统预留安全存储模型服务商配置的能力，为后续摘要、推荐调优等智能功能打基础。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20.x，Next.js（App Router 模式）  
**Primary Dependencies**: Next.js、React、Tailwind CSS、Shadcn UI、Prisma ORM、Supabase JS Client、Zod（或同类 schema 校验库）  
**Storage**: Supabase PostgreSQL（通过 Prisma 访问）+ Supabase Storage（用于缓存 PDF 或大对象）  
**Testing**: Vitest / Jest + React Testing Library（组件与逻辑）、Playwright（关键端到端路径，可按需引入）  
**Target Platform**: Vercel 或兼容 Next.js 运行时的 Node 环境（支持 Edge/Node 混合部署）  
**Project Type**: web（单一 Next.js 全栈项目）  
**Performance Goals**: 首屏论文流渲染中位时间 ≤ 3 秒；首页关键交互（切换筛选、打开详情）感知响应时间接近即时（≤ 500ms）  
**Constraints**:  
- 必须遵守《PaperX 宪章》中关于全栈 Next.js、Prisma + Supabase、arXiv 缓存与可观测性的原则；  
- 不额外引入独立后端进程，除非后续有充分论证并更新宪章；  
- 不在仓库中存储任何明文数据库或模型服务商凭据（全部走环境变量或安全配置机制）。  
**Scale/Scope**:  
- 初期目标：单区域部署，支撑 1–10k 注册用户、日活 1k 级别；  
- 数据量：每天新增数百篇感兴趣论文元数据，长期以 10–100 万量级论文缓存为上限进行设计；  
- 后续可通过 Supabase 扩展存储与水平扩展支持更大规模。  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **全栈 Next.js 架构优先**  
   - 本计划采用单一 Next.js App Router 应用，所有页面与 HTTP API 均通过 `app/` 路由与 Route Handlers 实现。  
   - 领域逻辑封装在 `lib/` 与 `app/(api)/` 下的服务模块中，前后端共享 TypeScript 类型，符合“统一栈 + 类型安全”的要求。  
   - **结论**: ✅ 符合宪章，无例外。  

2. **Tailwind + 组件库一致设计系统**  
   - 明确选择 **Shadcn UI** 作为首选组件库，与 Tailwind 深度集成；项目中不混用 Mantine。  
   - 定义基础设计 Token（色板、间距、排版）与基础布局/表单/按钮等 UI 基础组件，所有页面在其之上构建。  
   - **结论**: ✅ 符合宪章，无例外。  

3. **Prisma + Supabase 为单一数据源**  
   - 所有结构化数据（Paper、User、UserLibrary、ModelProviderConfig 等）通过 Prisma Schema 定义，映射到 Supabase Postgres。  
   - 数据访问仅通过 Prisma Client 完成，不直接在业务代码中书写 SQL；迁移全部由 Prisma Migration 管理。  
   - **结论**: ✅ 符合宪章，无例外。  

4. **arXiv 数据获取与缓存规范**  
   - 引入 `lib/arxiv/` 模块，集中处理 arXiv API 调用、限流、错误重试与日志；页面与 API Route 不直接拼 HTTP 请求。  
   - 从 arXiv 获取的元数据缓存到数据库（Paper 及其关联表），PDF 链接和必要文件缓存到 Supabase Storage，并设计显式的刷新/失效策略。  
   - 在 arXiv 不可用或受限时，通过使用本地缓存与友好提示实现降级。  
   - **结论**: ✅ 符合宪章，无例外。  

5. **可观测性与质量保障**  
   - 关键流程（首页检索、详情查看、收藏、推荐视图加载、模型服务商设置变更）均输出结构化日志与基础指标。  
   - TypeScript 开启严格模式；为核心模块（arXiv 客户端、收藏写操作、模型配置读写）编写最小单元/集成测试或清晰的手动验证步骤。  
   - 错误通过统一错误处理层包装，向用户呈现友好消息。  
   - **结论**: ✅ 符合宪章，无例外。  

> 当前规划下，未发现需要“临时例外”的实践，如未来必须引入独立后端或额外存储形态，应更新本节并在 PR 中说明理由与回滚方案。

## Project Structure

### Documentation (this feature)

```text
specs/1-paperx-landing/
├── spec.md          # 功能规格（已完成）
├── plan.md          # 本文件（实现规划）
├── research.md      # Phase 0 输出（后续生成）
├── data-model.md    # Phase 1 输出（后续生成）
├── quickstart.md    # Phase 1 输出（后续生成）
├── contracts/       # Phase 1 输出：API/路由契约
└── tasks.md         # Phase 2 输出（/speckit.tasks）
```

### Source Code (repository root)

```text
# Next.js 全栈单项目结构

app/
├── (public)/                # 无需登录的页面（首页论文流、论文详情等）
│   ├── page.tsx             # PaperX 首页（最新/热门论文流）
│   └── paper/[id]/page.tsx  # 论文详情视图
├── (auth)/                  # 登录/注册相关页面（如使用 Supabase Auth 或其他方案）
├── (user)/
│   └── library/page.tsx     # “我的文库”与收藏管理
├── (recommend)/
│   └── page.tsx             # “为你推荐”视图
├── (settings)/
│   └── model-providers/     # 模型服务商设置 UI
│       └── page.tsx
└── api/
    ├── papers/route.ts      # 列表与检索接口（首页流）
    ├── papers/[id]/route.ts # 单篇论文详情接口
    ├── library/route.ts     # 收藏/取消收藏相关接口
    ├── recommend/route.ts   # 推荐数据接口
    └── settings/model-providers/route.ts  # 模型服务商配置读写接口

lib/
├── arxiv/                   # arXiv API 客户端与缓存逻辑
│   ├── client.ts
│   └── mappers.ts
├── papers/                  # 论文领域服务（查询、排序、筛选）
├── library/                 # 用户文库领域服务
├── recommend/               # 推荐策略封装（含占位实现）
└── settings/model-providers # 模型服务商配置读写封装

components/
├── layout/                  # 布局与导航组件
├── ui/                      # 基于 Shadcn UI 的二次封装组件
└── papers/                  # 论文列表卡片、过滤条等

prisma/
├── schema.prisma            # Paper / User / UserLibrary / ModelProviderConfig 等模型定义
└── migrations/              # 由 Prisma 生成的迁移文件

tests/
├── unit/                    # 领域服务与工具函数单元测试
├── integration/             # 页面对外行为/关键流程集成测试
└── e2e/                     # 端到端测试（如首页加载与收藏流程）
```

**Structure Decision**: 采用单一 Next.js 应用作为前后端统一代码库，围绕 `app/` 路由组织页面与 API，`lib/` 承载核心领域逻辑与外部集成（arXiv、Supabase、模型服务商），`prisma/` 统一管理数据模型与迁移，`tests/` 根据不同测试层级组织用例。

## Complexity Tracking

> **当前没有主动违反宪章的复杂度决策，如后续需要增加额外服务或引入新的基础设施，请在此表中记录并在 PR 中说明理由。**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
|（空）|（尚无）|（尚无）|


