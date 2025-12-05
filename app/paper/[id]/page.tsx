import { notFound } from "next/navigation";

interface PaperDetailPageProps {
  params: { id: string };
}

export default async function PaperDetailPage({
  params
}: PaperDetailPageProps) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/papers/${params.id}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error("加载论文详情失败");
  }

  const paper = await res.json();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold leading-tight">{paper.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{paper.authors}</p>
      </header>
      <section className="rounded-lg border bg-background/40 p-4 text-sm leading-relaxed">
        {paper.abstract}
      </section>
    </main>
  );
}


