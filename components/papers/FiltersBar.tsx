interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function FiltersBar({ search, onSearchChange }: FiltersBarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="搜索标题或摘要关键字…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground sm:ml-4">
        后续可在此扩展时间范围、主题标签等筛选条件。
      </p>
    </div>
  );
}


