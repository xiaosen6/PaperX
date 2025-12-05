# PaperX 快速上手指南

本文档说明如何运行和配置 PaperX 项目，以及如何演示核心功能。

## 前置要求

- Node.js 20.x 或更高版本
- npm 或 yarn 或 pnpm
- Supabase 项目（用于数据库和存储）

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件（不要提交到 Git）：

```bash
# Supabase 数据库连接（从 Supabase Dashboard → Settings → Database 获取）
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.sjbbefacbgdexntzrwdt.supabase.co:5432/postgres"

# 可选：Next.js 基础 URL（用于生成完整链接）
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 功能演示

### 首页论文流（US1）

- 访问 `http://localhost:3000/` 查看最新/热门论文列表
- 使用顶部搜索栏按标题/摘要搜索论文
- 点击论文卡片查看详情页

**注意**：如果数据库为空，首页会显示空状态提示。你需要：
1. 确保 Supabase 数据库连接正常
2. 运行迁移创建表结构
3. 手动插入测试数据或等待 arXiv 同步任务（后续实现）

### 我的文库（US2）

**开发测试模式**：

1. 在浏览器控制台执行：
   ```javascript
   localStorage.setItem("paperx_user_id", "test-user-1");
   ```
2. 刷新页面
3. 访问 `http://localhost:3000/library` 查看“我的文库”页面
4. 在首页点击论文卡片上的“收藏”按钮，将论文添加到文库
5. 在文库页面可以查看已收藏的论文，支持按收藏时间或发布时间排序

**生产模式**：后续将接入 Supabase Auth 或其它认证系统，用户通过登录获得真实的 userId。

### 为你推荐（US3）

1. 确保已设置 userId（见上方“我的文库”部分）
2. 访问 `http://localhost:3000/recommend` 查看推荐列表
3. 推荐策略：
   - 如果用户有收藏历史：基于收藏论文的标签推荐相似论文
   - 如果没有收藏：返回最新论文（冷启动）
   - 自动排除用户已收藏的论文

### 模型服务商设置（US4）

**开发测试模式**：

1. 在浏览器控制台执行：
   ```javascript
   localStorage.setItem("paperx_is_admin", "true");
   ```
2. 刷新页面
3. 访问 `http://localhost:3000/settings/model-providers` 进入设置页面
4. 点击“添加新配置”创建模型服务商配置
5. 可以编辑、启用/禁用、删除配置

**生产模式**：后续应接入真实的权限系统，仅允许管理员访问此页面。

## 数据库结构

主要表：

- `Paper`: 论文元数据（标题、作者、摘要、来源等）
- `User`: 用户信息
- `UserLibrary`: 用户文库（收藏列表）
- `UserLibraryOnPaper`: 文库与论文的多对多关系
- `ModelProviderConfig`: 模型服务商配置

查看完整 schema：`prisma/schema.prisma`

## 常见问题

### 数据库连接失败

- 检查 `.env.local` 中的 `DATABASE_URL` 是否正确
- 确认 Supabase 项目未暂停
- 检查网络是否能访问 Supabase 数据库端点

### 首页显示“暂时没有可展示的论文数据”

- 数据库表可能为空，需要插入测试数据或等待 arXiv 同步
- 检查数据库连接是否正常

### 收藏/推荐功能需要登录

当前使用 localStorage 模拟用户身份，生产环境应接入真实认证系统。

## 下一步

- 接入真实的 Supabase Auth 认证
- 实现 arXiv API 同步任务，自动拉取最新论文并缓存
- 完善推荐算法，接入模型服务商进行智能推荐
- 添加更多筛选和排序选项
- 实现论文详情页的完整展示（PDF 预览等）

