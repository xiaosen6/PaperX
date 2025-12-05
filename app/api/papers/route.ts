import { NextRequest, NextResponse } from "next/server";
import { listPapers } from "@/lib/papers/service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 1, 1) : 1;
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 50) : 20;

  const offset = (page - 1) * pageSize;

  try {
    const { items, total } = await listPapers({
      searchQuery: q,
      limit: pageSize,
      offset
    });

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  } catch (error) {
    console.error("[api/papers] listPapers failed", error);

    return NextResponse.json(
      {
        data: [],
        error: "DATABASE_UNAVAILABLE",
        message:
          "当前无法连接到数据库，请检查 Supabase 配置或稍后重试。"
      },
      { status: 503 }
    );
  }
}


