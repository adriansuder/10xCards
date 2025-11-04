import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client';

/**
 * Public paths that don't require authentication.
 * These include login/register pages and their API endpoints.
 */
const PUBLIC_PATHS = [
  '/logowanie',
  '/rejestracja',
  '/api/auth/login',
  '/api/auth/register',
];

/**
 * Protected paths that require authentication.
 * Users must be logged in to access these routes.
 */
const PROTECTED_PATHS = [
  '/',
  '/moje-fiszki',
  '/ucz-sie',
  '/ustawienia',
  '/api/flashcards',
  '/api/review',
  '/api/profile',
  '/api/ai',
];

/**
 * Middleware for handling authentication and session management.
 * 
 * Flow:
 * 1. Creates Supabase server client with proper cookie handling
 * 2. Checks user session using getUser() (not setSession!)
 * 3. Stores user data in context.locals for use in pages/endpoints
 * 4. Protects routes based on authentication status
 * 5. Redirects as needed (logged in users from auth pages, logged out from protected pages)
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_') ||
    pathname.includes('.') // Skip files like .js, .css, .svg, etc.
  ) {
    return next();
  }

  // Create Supabase server client for ALL requests (including API endpoints)
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });

  // Store supabase client in context for use in API endpoints and pages
  context.locals.supabase = supabase;

  // Skip authentication logic for API endpoints - let them handle auth themselves
  if (pathname.startsWith('/api/')) {
    return next();
  }

  // IMPORTANT: Always call getUser() to verify the session
  // This also refreshes the session if needed and updates cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Debug logging (remove in production)
  console.log(`[Middleware] Path: ${pathname}, User: ${user ? user.email : 'none'}`);

  // Store user and session in context.locals
  if (user) {
    context.locals.user = user;
    
    // Get the full session for context
    const { data: { session } } = await supabase.auth.getSession();
    context.locals.session = session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  
  // Check if path is protected - but EXCLUDE public paths first!
  const isProtectedPath = !isPublicPath && PROTECTED_PATHS.some(path => {
    // Exact match for '/' to avoid matching everything
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  });

  // Redirect logged-in users away from auth pages
  if (user && isPublicPath) {
    console.log(`[Middleware] Redirecting logged-in user from ${pathname} to /`);
    return context.redirect('/');
  }

  // Redirect logged-out users from protected pages to login
  if (!user && isProtectedPath) {
    console.log(`[Middleware] Redirecting logged-out user from ${pathname} to /logowanie`);
    return context.redirect('/logowanie');
  }

  return next();
});