import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GetReviewSessionCommandSchema, ReviewService } from '../../../lib/services/review.service';
import type { ReviewSessionDto } from '../../../types';

export const prerender = false;

const GetReviewSessionParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const GET: APIRoute = async ({ locals, url }) => {
  const { user, supabase } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const searchParams = new URL(url).searchParams;
  const paramsValidation = GetReviewSessionParamsSchema.safeParse({
    limit: searchParams.get('limit'),
  });

  if (!paramsValidation.success) {
    return new Response(JSON.stringify({ message: 'Invalid input', errors: paramsValidation.error.flatten() }), {
      status: 400,
    });
  }

  const reviewService = new ReviewService(supabase);

  try {
    const commandValidation = GetReviewSessionCommandSchema.safeParse({
      userId: user.id,
      limit: paramsValidation.data.limit,
    });

    if (!commandValidation.success) {
      // This should technically not happen if paramsValidation is correct, but it's a good safeguard.
      return new Response(JSON.stringify({ message: 'Invalid command', errors: commandValidation.error.flatten() }), {
        status: 400,
      });
    }

    const cards = await reviewService.getReviewSessionCards(commandValidation.data);

    const response: ReviewSessionDto = { cards };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/review/session:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
