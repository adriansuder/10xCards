import type { AstroCookies } from 'astro';
import { createBrowserClient, createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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