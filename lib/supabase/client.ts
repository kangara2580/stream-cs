import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

export function createClient() {
  const { url, key } = getSupabaseEnv();

  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
