import type { APIRoute } from 'astro';
import { ReviewService } from '../../../lib/services/review.service';
import { updateCardReviewSchema } from '../../../lib/validators';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;

  // Guard: Check if user is authenticated
  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate request body
  const validationResult = updateCardReviewSchema.safeParse(requestBody);

  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: 'Validation failed',
        errors: validationResult.error.flatten(),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const reviewService = new ReviewService(supabase);

  try {
    await reviewService.updateCardReviewStatus({
      userId: user.id,
      ...validationResult.data,
    });

    // Return 204 No Content on success
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error in update card review endpoint:', error);

    // Handle specific error: flashcard not found
    if (error instanceof Error && error.message === 'FLASHCARD_NOT_FOUND') {
      return new Response(
        JSON.stringify({
          message: 'Flashcard not found or does not belong to the user',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generic server error
    return new Response(
      JSON.stringify({
        message: 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
