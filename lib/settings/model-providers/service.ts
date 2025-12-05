import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/observability/logger";

const prisma = new PrismaClient();

export interface CreateModelProviderInput {
  name: string;
  description?: string;
  provider: string; // e.g. "openai", "azure-openai", "custom-http"
  endpoint: string;
  apiKey: string;
  enabled?: boolean;
}

export interface UpdateModelProviderInput {
  name?: string;
  description?: string;
  provider?: string;
  endpoint?: string;
  apiKey?: string;
  enabled?: boolean;
}

/**
 * 获取所有模型服务商配置
 */
export async function listModelProviders() {
  logger.info("modelProviders.listModelProviders called");

  const providers = await prisma.modelProviderConfig.findMany({
    orderBy: { createdAt: "desc" }
  });

  // 返回时隐藏敏感信息（apiKey）
  return providers.map((p) => ({
    ...p,
    apiKey: p.apiKey ? "***" : "" // 仅显示占位符
  }));
}

/**
 * 获取单个模型服务商配置（包含真实 apiKey，仅用于服务端调用）
 */
export async function getModelProvider(id: string) {
  logger.info("modelProviders.getModelProvider called", { id });

  const provider = await prisma.modelProviderConfig.findUnique({
    where: { id }
  });

  if (!provider) {
    return null;
  }

  return provider; // 服务端可以返回真实 apiKey
}

/**
 * 创建模型服务商配置
 */
export async function createModelProvider(input: CreateModelProviderInput) {
  logger.info("modelProviders.createModelProvider called", {
    name: input.name,
    provider: input.provider
    // 不记录 apiKey
  });

  const provider = await prisma.modelProviderConfig.create({
    data: {
      name: input.name,
      description: input.description,
      provider: input.provider,
      endpoint: input.endpoint,
      apiKey: input.apiKey, // 当前阶段明文存储，后续应加密
      enabled: input.enabled ?? true
    }
  });

  logger.info("modelProviders.created", {
    id: provider.id,
    name: provider.name
  });

  return {
    ...provider,
    apiKey: "***" // 返回时隐藏
  };
}

/**
 * 更新模型服务商配置
 */
export async function updateModelProvider(
  id: string,
  input: UpdateModelProviderInput
) {
  logger.info("modelProviders.updateModelProvider called", {
    id,
    fields: Object.keys(input).filter((k) => k !== "apiKey")
    // 不记录 apiKey
  });

  const provider = await prisma.modelProviderConfig.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.provider !== undefined && { provider: input.provider }),
      ...(input.endpoint !== undefined && { endpoint: input.endpoint }),
      ...(input.apiKey !== undefined && { apiKey: input.apiKey }),
      ...(input.enabled !== undefined && { enabled: input.enabled })
    }
  });

  logger.info("modelProviders.updated", {
    id: provider.id,
    name: provider.name
  });

  return {
    ...provider,
    apiKey: "***" // 返回时隐藏
  };
}

/**
 * 删除模型服务商配置
 */
export async function deleteModelProvider(id: string) {
  logger.info("modelProviders.deleteModelProvider called", { id });

  await prisma.modelProviderConfig.delete({
    where: { id }
  });

  logger.info("modelProviders.deleted", { id });

  return { success: true };
}

/**
 * 切换模型服务商的启用状态
 */
export async function toggleModelProvider(id: string, enabled: boolean) {
  logger.info("modelProviders.toggleModelProvider called", { id, enabled });

  const provider = await prisma.modelProviderConfig.update({
    where: { id },
    data: { enabled }
  });

  logger.info("modelProviders.toggled", {
    id: provider.id,
    enabled: provider.enabled
  });

  return {
    ...provider,
    apiKey: "***"
  };
}

