import { NextRequest, NextResponse } from "next/server";
import { getRecommendedPapers } from "@/lib/recommend/service";

function getUserId(req: NextRequest): string | null {
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) {
    return headerUserId;
  }
  const url = new URL(req.url);
  const queryUserId = url.searchParams.get("userId");
  if (queryUserId) {
    return queryUserId;
  }
  return null;
}

/**
 * GET /api/recommend - 获取推荐论文列表
 */
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "需要登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await getRecommendedPapers(userId, {
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return NextResponse.json({
      data: result.items,
      pagination: {
        page,
        pageSize,
        total: result.total
      },
      strategy: result.strategy // 用于调试/展示推荐策略
    });
  } catch (error) {
    console.error("[api/recommend] GET failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "获取推荐列表失败"
      },
      { status: 500 }
    );
  }
}

