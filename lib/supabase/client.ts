"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseBrowserEnv } from "./env";
import type { Database } from "./database.types";

export function createClient() {
  const { url, publishableKey } = requireSupabaseBrowserEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
