import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/observability/logger";

const prisma = new PrismaClient();

/**
 * 为用户添加论文到默认文库（收藏）
 */
export async function addToLibrary(userId: string, paperId: string) {
  logger.info("library.addToLibrary called", { userId, paperId });

  // 查找或创建用户的默认文库
  let defaultLibrary = await prisma.userLibrary.findFirst({
    where: { userId, name: "默认收藏" }
  });

  if (!defaultLibrary) {
    defaultLibrary = await prisma.userLibrary.create({
      data: {
        userId,
        name: "默认收藏"
      }
    });
    logger.info("library.defaultLibrary created", { userId, libraryId: defaultLibrary.id });
  }

  // 检查是否已收藏
  const existing = await prisma.userLibraryOnPaper.findUnique({
    where: {
      libraryId_paperId: {
        libraryId: defaultLibrary.id,
        paperId
      }
    }
  });

  if (existing) {
    logger.info("library.paperAlreadyInLibrary", { userId, paperId, libraryId: defaultLibrary.id });
    return { success: true, alreadyExists: true };
  }

  // 添加到文库
  await prisma.userLibraryOnPaper.create({
    data: {
      libraryId: defaultLibrary.id,
      paperId
    }
  });

  logger.info("library.paperAdded", { userId, paperId, libraryId: defaultLibrary.id });
  return { success: true, alreadyExists: false };
}

/**
 * 从文库中移除论文（取消收藏）
 */
export async function removeFromLibrary(userId: string, paperId: string) {
  logger.info("library.removeFromLibrary called", { userId, paperId });

  // 查找用户的所有文库
  const libraries = await prisma.userLibrary.findMany({
    where: { userId }
  });

  if (libraries.length === 0) {
    return { success: false, message: "用户没有文库" };
  }

  // 从所有文库中移除该论文
  const libraryIds = libraries.map((lib) => lib.id);
  const deleted = await prisma.userLibraryOnPaper.deleteMany({
    where: {
      libraryId: { in: libraryIds },
      paperId
    }
  });

  logger.info("library.paperRemoved", {
    userId,
    paperId,
    removedFrom: deleted.count
  });

  return { success: true, removedCount: deleted.count };
}

/**
 * 检查论文是否在用户的文库中
 */
export async function isInLibrary(userId: string, paperId: string): Promise<boolean> {
  const libraries = await prisma.userLibrary.findMany({
    where: { userId },
    select: { id: true }
  });

  if (libraries.length === 0) {
    return false;
  }

  const libraryIds = libraries.map((lib) => lib.id);
  const exists = await prisma.userLibraryOnPaper.findFirst({
    where: {
      libraryId: { in: libraryIds },
      paperId
    }
  });

  return !!exists;
}

/**
 * 获取用户文库中的所有论文列表
 */
export async function getUserLibraryPapers(
  userId: string,
  options?: { limit?: number; offset?: number; orderBy?: "addedAt" | "publishedAt" }
) {
  logger.info("library.getUserLibraryPapers called", { userId, options });

  const libraries = await prisma.userLibrary.findMany({
    where: { userId },
    select: { id: true }
  });

  if (libraries.length === 0) {
    return { items: [], total: 0 };
  }

  const libraryIds = libraries.map((lib) => lib.id);

  const where = {
    libraryId: { in: libraryIds }
  };

  const [items, total] = await Promise.all([
    prisma.userLibraryOnPaper.findMany({
      where,
      include: {
        paper: true
      },
      skip: options?.offset ?? 0,
      take: options?.limit ?? 20,
      orderBy:
        options?.orderBy === "publishedAt"
          ? { paper: { publishedAt: "desc" } }
          : { addedAt: "desc" }
    }),
    prisma.userLibraryOnPaper.count({ where })
  ]);

  return {
    items: items.map((item) => ({
      ...item.paper,
      addedAt: item.addedAt
    })),
    total
  };
}

