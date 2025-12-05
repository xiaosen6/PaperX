"use client";

import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";

interface PaperCardProps {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  publishedAt: string;
  userId?: string; // 临时：后续应从 context/session 获取
}

export function PaperCard({
  id,
  title,
  abstract,
  authors,
  publishedAt,
  userId
}: PaperCardProps) {
  const date = new Date(publishedAt);

  return (
    <article className="rounded-lg border bg-background/40 p-4 shadow-sm transition hover:border-foreground/40">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold leading-snug">
            <Link href={`/paper/${id}`} className="hover:underline">
              {title}
            </Link>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {authors}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <time className="whitespace-nowrap text-xs text-muted-foreground">
            {Number.isNaN(date.getTime())
              ? ""
              : date.toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
          </time>
          <FavoriteButton paperId={id} userId={userId} />
        </div>
      </header>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
        {abstract}
      </p>
    </article>
  );
}


