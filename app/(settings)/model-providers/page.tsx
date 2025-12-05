"use client";

import { useEffect, useState } from "react";
import { ModelProviderForm } from "@/components/settings/ModelProviderForm";
import Link from "next/link";

interface ModelProvider {
  id: string;
  name: string;
  description?: string;
  provider: string;
  endpoint: string;
  apiKey: string; // 显示为 "***"
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ModelProvidersPage() {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 临时：检查是否为管理员（后续应使用真实的 session）
  const [isAdmin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("paperx_is_admin") === "true";
    }
    return false;
  });

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/model-providers?isAdmin=true");
      if (!res.ok) {
        throw new Error(`加载配置失败: ${res.status}`);
      }
      const json = await res.json();
      setProviders(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProviders();
    }
  }, [isAdmin]);

  const handleCreate = async (data: Omit<ModelProvider, "id" | "createdAt" | "updatedAt">) => {
    const res = await fetch("/api/settings/model-providers?isAdmin=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error("创建失败");
    }
    await loadProviders();
    setShowForm(false);
  };

  const handleUpdate = async (
    id: string,
    data: Omit<ModelProvider, "id" | "createdAt" | "updatedAt">
  ) => {
    const res = await fetch(`/api/settings/model-providers/${id}?isAdmin=true`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error("更新失败");
    }
    await loadProviders();
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此配置吗？")) {
      return;
    }
    const res = await fetch(`/api/settings/model-providers/${id}?isAdmin=true`, {
      method: "DELETE"
    });
    if (!res.ok) {
      alert("删除失败");
      return;
    }
    await loadProviders();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/settings/model-providers/${id}/toggle?isAdmin=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled })
    });
    if (!res.ok) {
      alert("切换状态失败");
      return;
    }
    await loadProviders();
  };

  if (!isAdmin) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">模型服务商设置</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            需要管理员权限才能访问此页面。
          </p>
        </header>
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>当前未登录或不是管理员。</p>
          <p className="mt-2 text-xs">
            开发测试：可在浏览器控制台执行{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              localStorage.setItem("paperx_is_admin", "true")
            </code>{" "}
            然后刷新页面。
          </p>
        </div>
      </main>
    );
  }

  const editingProvider = editingId
    ? providers.find((p) => p.id === editingId)
    : null;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">模型服务商设置</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理用于智能功能（摘要、推荐等）的模型服务商配置
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          返回首页
        </Link>
      </header>

      {!showForm && !editingId && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          添加新配置
        </button>
      )}

      {(showForm || editingId) && (
        <div className="rounded-lg border bg-background/40 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "编辑配置" : "新建配置"}
          </h2>
          <ModelProviderForm
            provider={editingProvider}
            onSubmit={async (data) => {
              if (editingId) {
                await handleUpdate(editingId, data);
              } else {
                await handleCreate(data);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </div>
      )}

      {loading && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          正在加载配置列表…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-4 text-sm text-red-100">
          加载失败：{error}
        </div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="rounded-lg border bg-background/40 p-6 text-sm text-muted-foreground">
          <p>暂无配置。</p>
          <p className="mt-2">点击上方“添加新配置”按钮创建第一个模型服务商配置。</p>
        </div>
      )}

      {!loading && !error && providers.length > 0 && (
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-lg border bg-background/40 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{provider.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        provider.enabled
                          ? "bg-green-950/40 text-green-100"
                          : "bg-gray-950/40 text-gray-100"
                      }`}
                    >
                      {provider.enabled ? "已启用" : "已禁用"}
                    </span>
                  </div>
                  {provider.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>
                      <strong>类型：</strong>
                      {provider.provider}
                    </p>
                    <p>
                      <strong>端点：</strong>
                      {provider.endpoint}
                    </p>
                    <p>
                      <strong>API 密钥：</strong>
                      {provider.apiKey || "未设置"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(provider.id, provider.enabled)}
                    className="rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    {provider.enabled ? "禁用" : "启用"}
                  </button>
                  <button
                    onClick={() => setEditingId(provider.id)}
                    className="rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-950/60"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

