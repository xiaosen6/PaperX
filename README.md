## PaperX

PaperX 是一个用于浏览、收藏和推荐学术论文的 Web 应用，采用 Next.js App Router + Tailwind CSS + Shadcn UI + Prisma + Supabase + arXiv 数据源构建。

本仓库当前处于初始化阶段，功能实现将按照 `specs/1-paperx-landing/` 目录下的 `spec.md`、`plan.md` 和 `tasks.md` 逐步推进。

### 开发环境快速开始

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量（在本地创建 `.env.local`，不要提交到 Git）：

```bash
DATABASE_URL="postgresql://postgres:<your-password>@db.sjbbefacbgdexntzrwdt.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

3. 运行开发服务器：

```bash
npm run dev
```

更多技术细节参见 `specs/1-paperx-landing/plan.md`。


