import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';

const protectedRoutes = ['/api/'];

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  const accessToken = context.cookies.get('sb-access-token');
  const refreshToken = context.cookies.get('sb-refresh-token');

  if (accessToken && refreshToken) {
    const { data } = await context.locals.supabase.auth.setSession({
      refresh_token: refreshToken.value,
      access_token: accessToken.value,
    });

    if (data?.user) {
      context.locals.user = data.user;
      context.locals.session = data.session;
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !context.locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return next();
});