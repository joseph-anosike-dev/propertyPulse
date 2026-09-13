import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database } from "@/integrations/supabase/types";

function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !key) {
    throw new Error("Public property catalogue is not configured.");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listPublishedProperties = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Properties could not be loaded.");
  return data;
});

export const getPublishedProperty = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const { data: property, error } = await createPublicClient()
      .from("properties")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error("Property could not be loaded.");
    return property;
  });