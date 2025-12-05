import type { ReactNode } from "react";
import Link from "next/link";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PaperX
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              首页
            </Link>
            <Link href="/library" className="hover:text-foreground">
              我的文库
            </Link>
            <Link href="/recommend" className="hover:text-foreground">
              为你推荐
            </Link>
            <Link href="/settings/model-providers" className="hover:text-foreground">
              设置
            </Link>
          </div>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          PaperX · 聚合与组织学术论文
        </div>
      </footer>
    </div>
  );
}


