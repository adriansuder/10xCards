import type { APIRoute } from 'astro';
import { z } from 'zod';
import { importFlashcardsRequestSchema } from '../../../lib/validators';
import { flashcardService } from '../../../lib/services/flashcard.service';
import { getProfile } from '../../../lib/services/profile.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400 });
  }

  try {
    const command = importFlashcardsRequestSchema.parse(body);

    const profile = await getProfile(supabase);
    const languageLevel = profile?.default_ai_level ?? 'b1';

    const result = await flashcardService.importAiFlashcards(supabase, user.id, command, languageLevel);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: 'Validation failed', errors: error.errors }), {
        status: 422,
      });
    }

    console.error('Error importing flashcards:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
