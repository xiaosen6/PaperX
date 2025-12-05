import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/observability/logger";

const prisma = new PrismaClient();

/**
 * 基于用户行为生成推荐论文列表（初版简单启发式策略）
 * 策略：
 * 1. 如果用户有收藏历史，基于收藏论文的标签/领域推荐相似论文
 * 2. 如果没有收藏，返回最新论文（作为冷启动）
 * 3. 排除用户已收藏的论文
 */
export async function getRecommendedPapers(
  userId: string,
  options?: { limit?: number; offset?: number }
) {
  logger.info("recommend.getRecommendedPapers called", { userId, options });

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  // 获取用户已收藏的论文 ID 列表（用于排除）
  const userLibraries = await prisma.userLibrary.findMany({
    where: { userId },
    include: {
      papers: {
        select: { paperId: true }
      }
    }
  });

  const excludedPaperIds = new Set<string>();
  userLibraries.forEach((lib) => {
    lib.papers.forEach((p) => {
      excludedPaperIds.add(p.paperId);
    });
  });

  // 策略1: 如果用户有收藏，尝试基于收藏论文的标签推荐
  if (excludedPaperIds.size > 0) {
    // 获取用户收藏论文的标签
    const favoritePapers = await prisma.paper.findMany({
      where: {
        id: { in: Array.from(excludedPaperIds) },
        tags: { not: null }
      },
      select: { tags: true }
    });

    const favoriteTags = new Set<string>();
    favoritePapers.forEach((p) => {
      if (p.tags) {
        // 简单分割标签（假设用逗号分隔）
        p.tags.split(",").forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            favoriteTags.add(trimmed.toLowerCase());
          }
        });
      }
    });

    // 如果有标签，推荐包含这些标签的论文
    if (favoriteTags.size > 0) {
      const tagArray = Array.from(favoriteTags);
      const recommended = await prisma.paper.findMany({
        where: {
          id: { notIn: Array.from(excludedPaperIds) },
          OR: tagArray.map((tag) => ({
            tags: { contains: tag, mode: "insensitive" }
          }))
        },
        orderBy: { publishedAt: "desc" },
        skip: offset,
        take: limit
      });

      if (recommended.length > 0) {
        logger.info("recommend.basedOnTags", {
          userId,
          tagCount: favoriteTags.size,
          recommendedCount: recommended.length
        });
        return {
          items: recommended,
          total: recommended.length, // 简化：不计算总数
          strategy: "tag-based"
        };
      }
    }
  }

  // 策略2: 冷启动 - 返回最新论文（排除已收藏的）
  const latestPapers = await prisma.paper.findMany({
    where: {
      id: excludedPaperIds.size > 0 ? { notIn: Array.from(excludedPaperIds) } : undefined
    },
    orderBy: { publishedAt: "desc" },
    skip: offset,
    take: limit
  });

  logger.info("recommend.coldStart", {
    userId,
    recommendedCount: latestPapers.length,
    hasFavorites: excludedPaperIds.size > 0
  });

  return {
    items: latestPapers,
    total: latestPapers.length,
    strategy: excludedPaperIds.size > 0 ? "latest-excluding-favorites" : "latest"
  };
}

/**
 * 记录用户对推荐论文的互动（点击、收藏等）
 */
export async function recordRecommendationInteraction(
  userId: string,
  paperId: string,
  interactionType: "view" | "favorite" | "click"
) {
  logger.info("recommend.recordInteraction", {
    userId,
    paperId,
    interactionType
  });

  // 当前阶段仅记录日志，后续可以存储到数据库用于推荐算法优化
  // 例如：创建 RecommendationInteraction 表记录这些事件
  // await prisma.recommendationInteraction.create({
  //   data: { userId, paperId, interactionType, timestamp: new Date() }
  // });

  return { success: true };
}

