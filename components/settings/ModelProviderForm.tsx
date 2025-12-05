"use client";

import { useState, useEffect } from "react";

interface ModelProvider {
  id?: string;
  name: string;
  description?: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  enabled: boolean;
}

interface ModelProviderFormProps {
  provider?: ModelProvider;
  onSubmit: (data: Omit<ModelProvider, "id">) => Promise<void>;
  onCancel: () => void;
}

export function ModelProviderForm({
  provider,
  onSubmit,
  onCancel
}: ModelProviderFormProps) {
  const [formData, setFormData] = useState<Omit<ModelProvider, "id">>({
    name: provider?.name || "",
    description: provider?.description || "",
    provider: provider?.provider || "openai",
    endpoint: provider?.endpoint || "",
    apiKey: provider?.apiKey || "",
    enabled: provider?.enabled ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">名称 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">说明</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">服务商类型 *</label>
        <select
          value={formData.provider}
          onChange={(e) =>
            setFormData({ ...formData, provider: e.target.value })
          }
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="azure-openai">Azure OpenAI</option>
          <option value="custom-http">自定义 HTTP API</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">端点 URL *</label>
        <input
          type="url"
          value={formData.endpoint}
          onChange={(e) =>
            setFormData({ ...formData, endpoint: e.target.value })
          }
          required
          placeholder="https://api.openai.com/v1"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">API 密钥 *</label>
        <input
          type="password"
          value={formData.apiKey === "***" ? "" : formData.apiKey}
          onChange={(e) =>
            setFormData({ ...formData, apiKey: e.target.value })
          }
          required
          placeholder={provider ? "留空则不更新" : "输入 API 密钥"}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        {provider && (
          <p className="mt-1 text-xs text-muted-foreground">
            留空则保持原有密钥不变
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={(e) =>
            setFormData({ ...formData, enabled: e.target.checked })
          }
          className="rounded border"
        />
        <label htmlFor="enabled" className="text-sm">
          启用此配置
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "提交中..." : provider ? "更新" : "创建"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}

