import type { APIRoute } from 'astro';
import { CreateFlashcardSchema } from '../../../lib/validators';
import type { CreateFlashcardCommand, FlashcardListQueryParams } from '../../../types';
import { flashcardService, type GetFlashcardsOptions } from '../../../lib/services/flashcard.service';

export const prerender = false;

/**
 * API endpoint to get paginated list of flashcards.
 * It handles GET requests with query parameters for pagination and sorting.
 * @returns {Response} A response object with flashcards list and pagination info.
 */
export const GET: APIRoute = async (context) => {
  const { supabase } = context.locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Parse query parameters
    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const sortBy = (url.searchParams.get('sortBy') || 'created_at') as 'created_at' | 'front' | 'leitner_box';
    const order = (url.searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // 3. Validate parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return new Response(
        JSON.stringify({ message: 'Invalid pagination parameters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const options: GetFlashcardsOptions = {
      page,
      pageSize,
      sortBy,
      order,
    };

    // 4. Service Call: Get flashcards from the database
    const result = await flashcardService.getFlashcards(supabase, user.id, options);

    // 5. Response: Return the flashcards list
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * API endpoint to create a new flashcard.
 * It handles POST requests, validates the input, and uses a service to create the flashcard.
 * @returns {Response} A response object with the new flashcard data or an error message.
 */
export const POST: APIRoute = async (context) => {
  const { supabase } = context.locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await context.request.json()) as CreateFlashcardCommand;

    // 2. Validation: Check if the request body conforms to the schema
    const validation = CreateFlashcardSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ errors: validation.error.flatten().fieldErrors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Service Call: Create the flashcard in the database
    const newFlashcard = await flashcardService.createFlashcard(supabase, user.id, validation.data);

    // 4. Response: Return the newly created flashcard
    return new Response(JSON.stringify(newFlashcard), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle potential errors from the service (e.g., database issues)
    if (error instanceof Error && error.message.includes('Database operation failed')) {
      return new Response(JSON.stringify({ message: 'Unprocessable Entity: Could not save the flashcard.' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generic server error for any other unexpected issues
    console.error('Internal Server Error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
