interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4">
      {title && (
        <p className="mb-2 text-sm font-medium text-red-100">{title}</p>
      )}
      <p className="text-sm text-red-100">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md border border-red-500/60 bg-red-950/60 px-3 py-1.5 text-xs text-red-100 hover:bg-red-950/80"
        >
          重试
        </button>
      )}
    </div>
  );
}

