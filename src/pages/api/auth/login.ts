import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

/**
 * Schema for login request validation.
 * Ensures email format and minimum password length.
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email jest wymagany.' })
    .email('Nieprawidłowy format adresu email.'),
  password: z
    .string({ required_error: 'Hasło jest wymagane.' })
    .min(6, 'Hasło musi mieć minimum 6 znaków.'),
});

/**
 * POST /api/auth/login
 * 
 * Handles user authentication via email and password.
 * Validates input, authenticates with Supabase, and sets secure session cookies.
 * 
 * Request body:
 * - email: string
 * - password: string
 * 
 * Success (200): { user: User }
 * Validation Error (422): { message: string, errors: ZodError[] }
 * Auth Error (400): { error: string }
 * Server Error (500): { error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Nieprawidłowe dane JSON.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate input with Zod
  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        message: 'Błąd walidacji danych.',
        errors: validation.error.errors,
      }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email, password } = validation.data;

  // Attempt to sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    
    // Map Supabase errors to user-friendly messages
    let errorMessage = 'Wystąpił błąd podczas logowania.';
    
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Nieprawidłowy email lub hasło.';
    } else if (error.message === 'Email not confirmed') {
      errorMessage = 'Konto nie zostało aktywowane. Sprawdź swoją skrzynkę email.';
    } else if (error.message.includes('Too many requests')) {
      errorMessage = 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.';
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Success - cookies are automatically set by Supabase server client
  return new Response(
    JSON.stringify({ user: data.user }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
