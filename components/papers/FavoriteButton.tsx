"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  paperId: string;
  userId?: string; // 临时：后续应从 context/session 获取
  className?: string;
}

export function FavoriteButton({ paperId, userId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查收藏状态
  useEffect(() => {
    if (!userId) {
      setIsFavorite(false);
      return;
    }

    let cancelled = false;
    async function checkStatus() {
      try {
        const res = await fetch(`/api/library/check?paperId=${paperId}&userId=${userId}`);
        if (!res.ok) {
          throw new Error("检查收藏状态失败");
        }
        const json = await res.json();
        if (!cancelled) {
          setIsFavorite(json.inLibrary ?? false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to check favorite status", e);
        }
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [paperId, userId]);

  const handleToggle = async () => {
    if (!userId) {
      setError("请先登录");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // 取消收藏
        const res = await fetch(`/api/library?paperId=${paperId}&userId=${userId}`, {
          method: "DELETE"
        });
        if (!res.ok) {
          throw new Error("取消收藏失败");
        }
        setIsFavorite(false);
      } else {
        // 添加收藏
        const res = await fetch("/api/library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId, userId })
        });
        if (!res.ok) {
          throw new Error("添加收藏失败");
        }
        setIsFavorite(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <button
        className={`flex items-center gap-1 text-sm text-muted-foreground ${className || ""}`}
        disabled
        title="请先登录"
      >
        <Heart className="h-4 w-4" />
        <span>收藏</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1 text-sm transition-colors ${
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className || ""}`}
      title={isFavorite ? "取消收藏" : "添加到收藏"}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      <span>{isFavorite ? "已收藏" : "收藏"}</span>
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
    </button>
  );
}

