"use client";

import { useEffect, useState } from "react";
import { PaperCard } from "@/components/papers/PaperCard";
import Link from "next/link";

interface PaperDto {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  publishedAt: string;
  addedAt?: string;
}

export default function LibraryPage() {
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<PaperDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<"addedAt" | "publishedAt">("addedAt");

  // 临时：从 localStorage 或 URL 参数获取 userId，后续应使用真实的 session
  const [userId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("paperx_user_id") || null;
    }
    return null;
  });

  useEffect(() => {
    if (!userId) {
      setError("请先登录");
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/library?userId=${userId}&orderBy=${orderBy}&page=1&pageSize=50`
        );
        if (!res.ok) {
          throw new Error(`加载文库失败: ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setPapers(json.data ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "未知错误");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, orderBy]);

  if (!userId) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">我的文库</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            请先登录以查看您的收藏论文。
          </p>
        </header>
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>当前未登录。后续将接入真实的认证系统（如 Supabase Auth）。</p>
          <p className="mt-2 text-xs">
            开发测试：可在浏览器控制台执行{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              localStorage.setItem("paperx_user_id", "test-user-1")
            </code>{" "}
            然后刷新页面。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">我的文库</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            您收藏的论文列表，共 {papers.length} 篇
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          返回首页
        </Link>
      </header>

      <div className="flex items-center gap-4">
        <label className="text-sm text-muted-foreground">排序方式：</label>
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as "addedAt" | "publishedAt")}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="addedAt">按收藏时间</option>
          <option value="publishedAt">按发布时间</option>
        </select>
      </div>

      {loading && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          正在加载您的文库…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-sm text-red-100">
          加载失败：{error}
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>您的文库目前是空的。</p>
          <p className="mt-2">
            前往 <Link href="/" className="text-primary hover:underline">首页</Link>{" "}
            浏览论文并添加到收藏吧！
          </p>
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <section className="grid gap-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} {...paper} />
          ))}
        </section>
      )}
    </main>
  );
}

