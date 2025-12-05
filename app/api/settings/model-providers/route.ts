import { NextRequest, NextResponse } from "next/server";
import {
  listModelProviders,
  createModelProvider,
  type CreateModelProviderInput
} from "@/lib/settings/model-providers/service";

// 临时：检查是否为管理员（后续应使用真实的权限系统）
function isAdmin(req: NextRequest): boolean {
  // 方案1: 从 header 获取
  const adminHeader = req.headers.get("x-is-admin");
  if (adminHeader === "true") {
    return true;
  }

  // 方案2: 从查询参数获取（仅用于开发测试）
  const url = new URL(req.url);
  const queryAdmin = url.searchParams.get("isAdmin");
  if (queryAdmin === "true") {
    return true;
  }

  // 方案3: 从 session/cookie 获取（后续实现）
  // const session = await getSession(req);
  // return session?.isAdmin ?? false;

  return false;
}

/**
 * GET /api/settings/model-providers - 获取所有模型服务商配置
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "需要管理员权限" },
        { status: 403 }
      );
    }

    const providers = await listModelProviders();

    return NextResponse.json({
      data: providers
    });
  } catch (error) {
    console.error("[api/settings/model-providers] GET failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "获取配置列表失败"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/model-providers - 创建新的模型服务商配置
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "需要管理员权限" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const input: CreateModelProviderInput = {
      name: body.name,
      description: body.description,
      provider: body.provider,
      endpoint: body.endpoint,
      apiKey: body.apiKey,
      enabled: body.enabled ?? true
    };

    // 基础验证
    if (!input.name || !input.provider || !input.endpoint || !input.apiKey) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "缺少必填字段" },
        { status: 400 }
      );
    }

    const provider = await createModelProvider(input);

    return NextResponse.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error("[api/settings/model-providers] POST failed", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "创建配置失败"
      },
      { status: 500 }
    );
  }
}

