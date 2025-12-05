import type { ReactNode } from "react";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata = {
  title: "PaperX",
  description: "PaperX - Explore and organize research papers"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-background text-foreground">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}


