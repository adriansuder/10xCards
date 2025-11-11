import type { APIContext } from 'astro';
import { flashcardService } from '../../../lib/services/flashcard.service';
import { GetFlashcardParamsSchema, UpdateFlashcardSchema } from '../../../lib/validators';

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const params = context.params;

  const validationResult = GetFlashcardParamsSchema.safeParse(params);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid request parameters.',
        errors: validationResult.error.flatten().fieldErrors,
      }),
      { status: 400 }
    );
  }

  const { id: flashcardId } = validationResult.data;

  try {
    const flashcard = await flashcardService.getFlashcardById(supabase, flashcardId);

    if (!flashcard) {
      return new Response(JSON.stringify({ message: 'Flashcard not found or access denied.' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred.' }), {
      status: 500,
    });
  }
}

/**
 * PATCH endpoint to update an existing flashcard.
 * Allows partial updates of front, back, and part_of_speech fields.
 * 
 * @param context - Astro API context with locals (supabase, session), params, and request
 * @returns Response with updated flashcard or error message
 */
export async function PATCH(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate flashcard ID from URL params
  const params = context.params;
  const paramsValidation = GetFlashcardParamsSchema.safeParse(params);
  
  if (!paramsValidation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid flashcard ID.',
        errors: paramsValidation.error.flatten().fieldErrors,
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const { id: flashcardId } = paramsValidation.data;

  // Parse and validate request body
  let requestBody;
  try {
    requestBody = await context.request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid JSON in request body.' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Guard clause: Check if request body is empty
  if (!requestBody || Object.keys(requestBody).length === 0) {
    return new Response(
      JSON.stringify({ message: 'Request body cannot be empty. Provide at least one field to update.' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Validate request body against schema
  const bodyValidation = UpdateFlashcardSchema.safeParse(requestBody);
  
  if (!bodyValidation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid request data.',
        errors: bodyValidation.error.flatten().fieldErrors,
      }),
      { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Update flashcard through service
    const updatedFlashcard = await flashcardService.updateFlashcard(
      supabase,
      flashcardId,
      user.id,
      bodyValidation.data
    );

    // Guard clause: Check if flashcard was found and updated
    if (!updatedFlashcard) {
      return new Response(
        JSON.stringify({ message: 'Flashcard not found or access denied.' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Happy path: Return updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return new Response(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE endpoint to delete an existing flashcard.
 * 
 * @param context - Astro API context with locals (supabase, session), params, and request
 * @returns Response with success message or error message
 */
export async function DELETE(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate flashcard ID from URL params
  const params = context.params;
  const paramsValidation = GetFlashcardParamsSchema.safeParse(params);
  
  if (!paramsValidation.success) {
    return new Response(
      JSON.stringify({
        message: 'Invalid flashcard ID.',
        errors: paramsValidation.error.flatten().fieldErrors,
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const { id: flashcardId } = paramsValidation.data;

  try {
    // Delete flashcard through service
    const deleted = await flashcardService.deleteFlashcard(
      supabase,
      flashcardId,
      user.id
    );

    // Guard clause: Check if flashcard was found and deleted
    if (!deleted) {
      return new Response(
        JSON.stringify({ message: 'Flashcard not found or access denied.' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Happy path: Return success
    return new Response(JSON.stringify({ message: 'Flashcard deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new Response(
      JSON.stringify({ message: 'An internal server error occurred.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
