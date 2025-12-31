import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient } from "@bookpulse/shared";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabaseConfig";

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
