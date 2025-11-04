import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

/**
 * Schema for registration request validation.
 * Enforces email format and minimum 8 character password (as per US-001 AC-3).
 */
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email jest wymagany.' })
    .email('Nieprawidłowy format adresu email.'),
  password: z
    .string({ required_error: 'Hasło jest wymagane.' })
    .min(8, 'Hasło musi mieć minimum 8 znaków.'),
});

/**
 * POST /api/auth/register
 * 
 * Handles user registration via email and password.
 * Validates input, creates account with Supabase, and sets secure session cookies.
 * 
 * Email Confirmation Behavior:
 * - If enable_confirmations = false (current): User is auto-logged in, session is created
 * - If enable_confirmations = true: User must verify email before logging in, no session yet
 * 
 * Request body:
 * - email: string
 * - password: string (min. 8 characters)
 * 
 * Success (201): { user: User, requiresEmailConfirmation: boolean }
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
  const validation = registerSchema.safeParse(body);
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

  // Attempt to sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Registration error:', error);
    
    // Map Supabase errors to user-friendly messages
    let errorMessage = 'Wystąpił błąd podczas rejestracji.';
    
    if (error.message === 'User already registered') {
      errorMessage = 'Użytkownik o tym adresie email już istnieje.';
    } else if (error.message.includes('Password')) {
      errorMessage = 'Hasło jest zbyt słabe. Użyj silniejszego hasła.';
    } else if (error.message === 'Signup is disabled') {
      errorMessage = 'Rejestracja jest tymczasowo wyłączona.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Nieprawidłowy adres email.';
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if email confirmation is required
  // When enable_confirmations is true in Supabase config, user needs to verify email
  const requiresEmailConfirmation = !data.session;

  // Success - cookies are automatically set by Supabase server client
  // User is now logged in (US-001 AC-4) - unless email confirmation is required
  return new Response(
    JSON.stringify({ 
      user: data.user,
      requiresEmailConfirmation 
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
