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
}

export default function RecommendPage() {
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<PaperDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<string>("");

  // 临时：从 localStorage 获取 userId
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
        const res = await fetch(`/api/recommend?userId=${userId}&page=1&pageSize=50`);
        if (!res.ok) {
          throw new Error(`加载推荐列表失败: ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setPapers(json.data ?? []);
          setStrategy(json.strategy || "");
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
  }, [userId]);

  const getStrategyText = (strategy: string) => {
    switch (strategy) {
      case "tag-based":
        return "基于您收藏论文的标签推荐";
      case "latest-excluding-favorites":
        return "最新论文（已排除您的收藏）";
      case "latest":
        return "最新论文（冷启动）";
      default:
        return "个性化推荐";
    }
  };

  if (!userId) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">为你推荐</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            请先登录以查看个性化推荐。
          </p>
        </header>
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>当前未登录。后续将接入真实的认证系统。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">为你推荐</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {strategy ? getStrategyText(strategy) : "基于您的兴趣和行为推荐"}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          返回首页
        </Link>
      </header>

      {loading && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          正在加载推荐列表…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-sm text-red-100">
          加载失败：{error}
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>暂无推荐内容。</p>
          <p className="mt-2">
            前往 <Link href="/" className="text-primary hover:underline">首页</Link>{" "}
            浏览论文并添加到收藏，系统将基于您的兴趣生成更精准的推荐。
          </p>
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <>
          {strategy && (
            <div className="rounded-lg border bg-blue-950/40 p-3 text-sm text-blue-100">
              <strong>推荐策略：</strong> {getStrategyText(strategy)}
            </div>
          )}
          <section className="grid gap-4">
            {papers.map((paper) => (
              <PaperCard key={paper.id} {...paper} userId={userId || undefined} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

