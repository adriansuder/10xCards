import type { APIRoute } from 'astro';
import { CreateFlashcardSchema } from '../../../lib/validators';
import type { CreateFlashcardCommand } from '../../../types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../db/database.types';

export const prerender = false;

/**
 * API endpoint to create a new flashcard.
 * It handles POST requests, validates the input, and uses a service to create the flashcard.
 * @returns {Response} A response object with the new flashcard data or an error message.
 */
export const POST: APIRoute = async (context) => {
  const { session, supabase } = context.locals;

  // 1. Authentication: Ensure user is logged in
  if (!session?.user) {
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
    const newFlashcard = await createFlashcard(session.user.id, validation.data, supabase);

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
function createFlashcard(id: string, data: { back: string; front: string; part_of_speech?: string | undefined; }, supabase: SupabaseClient<Database, "public", "public", { Tables: { ai_generation_logs: { Row: { created_at: string; generated_count: number; id: string; imported_count: number; user_id: string; }; Insert: { created_at?: string; generated_count: number; id?: string; imported_count: number; user_id: string; }; Update: { created_at?: string; generated_count?: number; id?: string; imported_count?: number; user_id?: string; }; Relationships: []; }; flashcards: { Row: { ai_generated: boolean; back: string; created_at: string; flashcard_language_level: Database["public"]["Enums"]["language_level"] | null; front: string; id: string; leitner_box: number; part_of_speech: string | null; review_due_at: string; updated_at: string; user_id: string; }; Insert: { ai_generated?: boolean; back: string; created_at?: string; flashcard_language_level?: Database["public"]["Enums"]["language_level"] | null; front: string; id?: string; leitner_box?: number; part_of_speech?: string | null; review_due_at?: string; updated_at?: string; user_id: string; }; Update: { ai_generated?: boolean; back?: string; created_at?: string; flashcard_language_level?: Database["public"]["Enums"]["language_level"] | null; front?: string; id?: string; leitner_box?: number; part_of_speech?: string | null; review_due_at?: string; updated_at?: string; user_id?: string; }; Relationships: []; }; profiles: { Row: { created_at: string; default_ai_level: string; id: string; updated_at: string; }; Insert: { created_at?: string; default_ai_level?: string; id: string; updated_at?: string; }; Update: { created_at?: string; default_ai_level?: string; id?: string; updated_at?: string; }; Relationships: []; }; }; Views: { [_ in never]: never; }; Functions: { update_flashcard_review: { Args: { p_flashcard_id: string; p_knew_it: boolean; }; Returns: undefined; }; }; Enums: { language_level: "a1" | "a2" | "b1" | "b2" | "c1" | "c2"; }; CompositeTypes: { [_ in never]: never; }; }, { PostgrestVersion: "12"; }>) {
  throw new Error('Function not implemented.');
}

