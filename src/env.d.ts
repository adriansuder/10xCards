/// <reference types="astro/client" />
/// <reference types="./db/supabase.client" />

declare namespace App {
  interface Locals {
    supabase: import('./db/supabase.client').SupabaseClient;
    session: import('./db/supabase.client').Session | null;
    user: import('./db/supabase.client').User | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
