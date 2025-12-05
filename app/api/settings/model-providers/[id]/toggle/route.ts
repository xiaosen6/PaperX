import { NextRequest, NextResponse } from "next/server";
import { toggleModelProvider } from "@/lib/settings/model-providers/service";

function isAdmin(req: NextRequest): boolean {
  const adminHeader = req.headers.get("x-is-admin");
  if (adminHeader === "true") {
    return true;
  }
  const url = new URL(req.url);
  const queryAdmin = url.searchParams.get("isAdmin");
  if (queryAdmin === "true") {
    return true;
  }
  return false;
}

/**
 * POST /api/settings/model-providers/[id]/toggle - 切换启用状态
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "需要管理员权限" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const enabled = body.enabled ?? true;

    const provider = await toggleModelProvider(params.id, enabled);

    return NextResponse.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error("[api/settings/model-providers/[id]/toggle] POST failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "切换状态失败"
      },
      { status: 500 }
    );
  }
}

