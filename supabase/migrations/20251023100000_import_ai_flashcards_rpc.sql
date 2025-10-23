-- Supabase migration script for creating the import_ai_flashcards RPC function

CREATE OR REPLACE FUNCTION import_ai_flashcards(
  flashcards_data jsonb,
  metrics_data jsonb,
  user_id_input uuid,
  language_level_input text
)
RETURNS jsonb AS $$
DECLARE
  inserted_flashcards_count integer;
  log_id uuid;
BEGIN
  -- Insert flashcards
  INSERT INTO public.flashcards (
    user_id,
    front,
    back,
    part_of_speech,
    ai_generated,
    flashcard_language_level
  )
  SELECT
    user_id_input,
    (f->>'front')::text,
    (f->>'back')::text,
    (f->>'part_of_speech')::text,
    TRUE,
    language_level_input::language_level
  FROM jsonb_array_elements(flashcards_data) AS f;

  GET DIAGNOSTICS inserted_flashcards_count = ROW_COUNT;

  -- Insert generation log
  INSERT INTO public.ai_generation_logs (
    user_id,
    generated_count,
    imported_count
  )
  VALUES (
    user_id_input,
    (metrics_data->>'generatedCount')::integer,
    (metrics_data->>'importedCount')::integer
  )
  RETURNING id INTO log_id;

  -- Return success response
  RETURN jsonb_build_object(
    'message', 'Successfully imported ' || inserted_flashcards_count || ' flashcards.',
    'importedCount', inserted_flashcards_count,
    'logId', log_id
  );
END;
$$ LANGUAGE plpgsql;
