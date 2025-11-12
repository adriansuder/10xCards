import type { AstroCookies } from 'astro';
import { createBrowserClient, createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Prefer runtime process.env values (set by dotenv/dev script) and fall back to import.meta.env
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public environment variables. Please check your .env file.');
}

/**
 * Cookie options for Supabase authentication cookies.
 * Uses secure settings to protect session data.
 */
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: import.meta.env.PROD, // Only secure in production
  httpOnly: true, // Prevent JavaScript access to cookies
  sameSite: 'lax',
};

/**
 * Browser client for Supabase.
 * Use this in React components and client-side code.
 * Automatically manages session state in cookies and localStorage.
 */
export const supabaseClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookieOptions,
  }
);

/**
 * Parses the Cookie header string into an array of cookie objects.
 * Required for proper cookie handling in server-side context.
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

/**
 * Creates a Supabase server client for use in Astro server context.
 * This client properly handles cookies for server-side authentication.
 * 
 * IMPORTANT: Always use getAll/setAll for cookie management (never individual get/set/remove).
 * 
 * @param context - Astro context containing headers and cookies
 * @returns Configured Supabase server client
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  // Use service role key on the server when available, otherwise fall back to anon key
  const serverKey = supabaseServiceRoleKey || supabaseAnonKey;

  // Log which key type is being used for server requests to help debugging in dev
  try {
    const keyType = supabaseServiceRoleKey ? 'service_role' : 'anon';
    // Partially mask key in logs
    const maskedKey = serverKey ? `${serverKey.slice(0, 6)}...${serverKey.slice(-4)}` : 'undefined';
  } catch (e) {
    // ignore logging errors
  }

  return createServerClient<Database>(
    supabaseUrl,
    serverKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          );
        },
      },
    }
  );
};

export type SupabaseClient = typeof supabaseClient;
export type { Session, User };