import { NextRequest, NextResponse } from "next/server";
import { isInLibrary } from "@/lib/library/service";

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
 * GET /api/library/check?paperId=xxx - 检查论文是否在用户文库中
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
    const paperId = searchParams.get("paperId");

    if (!paperId) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "缺少 paperId 参数" },
        { status: 400 }
      );
    }

    const inLibrary = await isInLibrary(userId, paperId);

    return NextResponse.json({
      inLibrary
    });
  } catch (error) {
    console.error("[api/library/check] GET failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "检查收藏状态失败"
      },
      { status: 500 }
    );
  }
}

