import { NextRequest, NextResponse } from "next/server";
import {
  getModelProvider,
  updateModelProvider,
  deleteModelProvider,
  toggleModelProvider,
  type UpdateModelProviderInput
} from "@/lib/settings/model-providers/service";

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
 * GET /api/settings/model-providers/[id] - 获取单个配置
 */
export async function GET(
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

    const provider = await getModelProvider(params.id);
    if (!provider) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "配置不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...provider,
        apiKey: "***" // 隐藏敏感信息
      }
    });
  } catch (error) {
    console.error("[api/settings/model-providers/[id]] GET failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "获取配置失败"
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/model-providers/[id] - 更新配置
 */
export async function PATCH(
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
    const input: UpdateModelProviderInput = {};

    if (body.name !== undefined) input.name = body.name;
    if (body.description !== undefined) input.description = body.description;
    if (body.provider !== undefined) input.provider = body.provider;
    if (body.endpoint !== undefined) input.endpoint = body.endpoint;
    if (body.apiKey !== undefined) input.apiKey = body.apiKey;
    if (body.enabled !== undefined) input.enabled = body.enabled;

    const provider = await updateModelProvider(params.id, input);

    return NextResponse.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error("[api/settings/model-providers/[id]] PATCH failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "更新配置失败"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/model-providers/[id] - 删除配置
 */
export async function DELETE(
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

    await deleteModelProvider(params.id);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("[api/settings/model-providers/[id]] DELETE failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "删除配置失败"
      },
      { status: 500 }
    );
  }
}

