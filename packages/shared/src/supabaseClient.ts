import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<"public">
) =>
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    ...options,
  });
