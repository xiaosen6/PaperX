import { PrismaClient } from "@prisma/client";
import { arxivClient } from "@/lib/arxiv/client";
import { logger } from "@/lib/observability/logger";

const prisma = new PrismaClient();

interface ListPapersParams {
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export async function listPapers({
  searchQuery,
  limit = 20,
  offset = 0
}: ListPapersParams) {
  // 当前阶段仅从本地数据库读取，后续会在 US1 任务中补充“缓存失效时回源 arXiv 并刷新缓存”的逻辑。
  logger.info("papers.listPapers called", { searchQuery, limit, offset });

  const where =
    searchQuery && searchQuery.trim().length > 0
      ? {
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { abstract: { contains: searchQuery, mode: "insensitive" } }
          ]
        }
      : undefined;

  const [items, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { publishedAt: "desc" }
    }),
    prisma.paper.count({ where })
  ]);

  return { items, total };
}


