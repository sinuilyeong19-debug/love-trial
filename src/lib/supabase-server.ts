import { createClient } from "@supabase/supabase-js"

export function createServerSupabase() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const url = rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co"
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"
  return createClient(url, key)
}
