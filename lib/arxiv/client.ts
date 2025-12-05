// arXiv API 客户端骨架：负责与 arXiv 通信、节流与错误包装。

export interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  publishedAt: Date;
  link: string;
  tags?: string[];
}

export interface FetchPapersOptions {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export class ArxivClient {
  async fetchLatestPapers(
    options: FetchPapersOptions = {}
  ): Promise<ArxivPaper[]> {
    // TODO: 实现真实的 arXiv API 调用与 XML/Atom 解析。
    // 为避免当前阶段阻塞开发，这里返回一个空数组占位，并在日志中记录。
    console.warn("[arxiv] fetchLatestPapers called with options:", options);
    return [];
  }
}

export const arxivClient = new ArxivClient();


