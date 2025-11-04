import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * POST /api/auth/logout
 * 
 * Handles user logout.
 * Signs out the user and clears all session cookies automatically via Supabase.
 * 
 * Success (200): Empty response
 * Auth Error (400): { error: string }
 * Server Error (500): { error: string }
 */
export const POST: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  // Sign out the user - Supabase automatically clears cookies
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Wystąpił błąd podczas wylogowania.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Success - cookies are automatically cleared by Supabase server client
  return new Response(null, { status: 200 });
};
