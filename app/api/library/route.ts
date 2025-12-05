import { NextRequest, NextResponse } from "next/server";
import {
  addToLibrary,
  removeFromLibrary,
  getUserLibraryPapers,
  isInLibrary
} from "@/lib/library/service";

// 临时：在没有真实认证的情况下，使用查询参数或 header 传递 userId
// 后续应替换为真实的 session/auth 机制
function getUserId(req: NextRequest): string | null {
  // 方案1: 从 header 获取（如 X-User-Id）
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) {
    return headerUserId;
  }

  // 方案2: 从查询参数获取（仅用于开发测试）
  const url = new URL(req.url);
  const queryUserId = url.searchParams.get("userId");
  if (queryUserId) {
    return queryUserId;
  }

  // 方案3: 从 cookie/session 获取（后续实现）
  // const session = await getSession(req);
  // return session?.userId ?? null;

  return null;
}

/**
 * GET /api/library - 获取用户文库中的论文列表
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
    const orderBy = (searchParams.get("orderBy") as "addedAt" | "publishedAt") || "addedAt";

    const { items, total } = await getUserLibraryPapers(userId, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy
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
    console.error("[api/library] GET failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "获取文库列表失败"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library - 添加论文到文库（收藏）
 */
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "需要登录" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { paperId } = body;

    if (!paperId || typeof paperId !== "string") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "缺少 paperId" },
        { status: 400 }
      );
    }

    const result = await addToLibrary(userId, paperId);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[api/library] POST failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "添加收藏失败"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/library - 从文库中移除论文（取消收藏）
 */
export async function DELETE(req: NextRequest) {
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

    const result = await removeFromLibrary(userId, paperId);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[api/library] DELETE failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "取消收藏失败"
      },
      { status: 500 }
    );
  }
}

