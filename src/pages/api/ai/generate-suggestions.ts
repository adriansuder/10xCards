import type { APIRoute } from 'astro';
import { z } from 'zod';
import { generateFlashcardSuggestions } from '../../../lib/ai.service';
import type { GenerateSuggestionsResponseDto } from '../../../types';

const GenerateSuggestionsPayloadSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty.')
    .max(2000, 'Text cannot exceed 2000 characters.'),
  level: z.enum(['a1','a2','b1', 'b2', 'c1','c2'], { message: 'Invalid language level.' }),
});

export const POST: APIRoute = async (context) => {
  const { user } = context.locals;

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const validation = GenerateSuggestionsPayloadSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify(validation.error.flatten()), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { text, level } = validation.data;

  try {
    const suggestions = await generateFlashcardSuggestions(text, level);

    const response: GenerateSuggestionsResponseDto = {
      suggestions,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating flashcard suggestions:', error);
    return new Response('Failed to communicate with AI service.', { status: 502 });
  }
};
