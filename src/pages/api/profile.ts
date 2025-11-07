import type { APIRoute } from 'astro';
import { profileService } from '../../lib/services/profile.service';
import { updateProfileSchema } from '../../lib/validators';
import type { UpdateProfileCommand, UpdateProfileDto } from '../../types';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const userProfile = await profileService.getUserProfile(supabase, user.id);
    return new Response(JSON.stringify(userProfile), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    if (errorMessage === 'User profile not found.') {
      return new Response(JSON.stringify({ message: errorMessage }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Server error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * PATCH endpoint to update user profile settings.
 * Currently supports updating the default_ai_level field.
 * 
 * @param context - Astro API context with locals (supabase, user) and request
 * @returns Response with updated profile or error message
 */
export const PATCH: APIRoute = async ({ locals, request }) => {
  const { supabase } = locals;

  // 1. Authentication: Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Parse and validate request body
  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid JSON format in request body.' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const validationResult = updateProfileSchema.safeParse(requestBody);
  
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: 'Validation failed.',
        errors: validationResult.error.flatten().fieldErrors,
      }),
      { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const validatedData: UpdateProfileDto = validationResult.data;

  // Create command object for service layer
  const command: UpdateProfileCommand = {
    userId: user.id,
    default_ai_level: validatedData.default_ai_level,
  };

  try {
    const updatedProfile = await profileService.updateProfile(supabase, command);
    
    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    // Handle profile not found error
    if (errorMessage === 'User profile not found.') {
      return new Response(JSON.stringify({ message: errorMessage }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log and return generic server error
    console.error('Error updating user profile:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
