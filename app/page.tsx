"use client";

import { useEffect, useState } from "react";
import { PaperCard } from "@/components/papers/PaperCard";
import { FiltersBar } from "@/components/papers/FiltersBar";

interface PaperDto {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  publishedAt: string;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<PaperDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  // 临时：从 localStorage 获取 userId，后续应使用真实的 session
  const [userId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("paperx_user_id") || null;
    }
    return null;
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set("q", search.trim());
        }
        const res = await fetch(`/api/papers?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`加载论文列表失败: ${res.status}`);
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
  }, [search]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">PaperX</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          浏览最新/热门论文流，后续会加入收藏与推荐视图。
        </p>
      </header>

      <FiltersBar search={search} onSearchChange={setSearch} />

      {loading && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          正在加载论文列表…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-sm text-red-100">
          加载论文失败：{error}
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          暂时没有可展示的论文数据。配置好数据库并运行迁移后，这里将展示来自 Supabase 缓存的论文以及 arXiv 同步结果。
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <section className="grid gap-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} {...paper} userId={userId || undefined} />
          ))}
        </section>
      )}
    </main>
  );
}

