import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // 在开发阶段使用 console.warn 提示，避免在构建时直接抛错
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 未配置，Supabase 客户端将不可用。"
  );
}

export const supabaseBrowserClient =
  url && anonKey ? createClient(url, anonKey) : null;


