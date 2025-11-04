import { GenerateSuggestionsResponseSchema, type AiSuggestion } from '../types';
import { OpenRouterService } from './services/openrouter.service';

/**
 * System prompt defining the AI's role and behavior for flashcard generation.
 * Instructs the model to act as a language learning expert and enforce
 * strict adherence to the provided JSON schema.
 */
const SYSTEM_PROMPT = `You are an expert linguist specializing in generating flashcards for language learners.
Your task is to analyze the provided text and create a list of flashcards based on the user's target language level.

Each flashcard must contain:
- 'front' (the word or phrase in the source language)
- 'back' (ALWAYS in Polish, following this EXACT format: "polskie tłumaczenie (krótka definicja lub wyjaśnienie)")
- 'part_of_speech' (the grammatical category, e.g., noun, verb, adjective, or null if not applicable)

CRITICAL RULES for 'back' field:
1. ALWAYS write in Polish language
2. ALWAYS use this format: "tłumaczenie (definicja)"
3. The translation must be a single Polish word or short phrase
4. The definition in parentheses must be a brief explanation in Polish (5-10 words max)
5. Examples of correct format:
   - "szybki (poruszający się z dużą prędkością)"
   - "biec (przemieszczać się szybko na nogach)"
   - "piękny (przyjemny dla oka, ładny)"

Generate flashcards that are appropriate for the specified language level, focusing on vocabulary that matches the learner's proficiency.

You MUST respond with a valid JSON object following this exact structure:
{
  "suggestions": [
    {
      "front": "word or phrase in source language",
      "back": "polskie tłumaczenie (krótka definicja po polsku)",
      "part_of_speech": "noun" or null
    }
  ]
}

Do not include any text before or after the JSON object. Only return valid JSON.`;

/**
 * Generates flashcard suggestions based on the provided text and language level
 * by communicating with the OpenRouter AI service.
 *
 * @param text The source text to analyze for flashcard generation.
 * @param level The target language level for the generated flashcards (e.g., 'b1', 'b2', 'c1').
 * @returns A promise that resolves to an array of AI-generated flashcard suggestions with temporary UUIDs.
 * @throws {Error} If the AI service communication fails or response validation fails.
 */
export async function generateFlashcardSuggestions(
  text: string,
  level: string
): Promise<AiSuggestion[]> {
  try {
    // Initialize the OpenRouter service
    const openRouterService = new OpenRouterService();

    // Construct the user prompt with the text and level
    const userPrompt = `Please generate flashcard suggestions from the following text for a user at the ${level} language level:

---TEXT---
${text}
---END TEXT---

Generate flashcards that help the learner understand key vocabulary at their proficiency level.`;

    // Request structured completion from the AI model
    // Using Meta Llama 3.2 - reliable free model with good JSON support
    const response = await openRouterService.getStructuredCompletion<{ suggestions: AiSuggestion[] }>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      responseSchema: GenerateSuggestionsResponseSchema,
      params: {
        temperature: 0.5, // Balanced between creativity and consistency
      },
    });

    // Add temporary client-side UUIDs to each suggestion
    // These IDs are used for UI management before the flashcards are imported to the database
    return response.suggestions.map(suggestion => ({
      ...suggestion,
      id: crypto.randomUUID(),
    }));

  } catch (error) {
    console.error('Failed to generate flashcard suggestions:', error);
    
    // Re-throw with a user-friendly message
    throw new Error(
      'An error occurred while generating AI suggestions. Please try again.'
    );
  }
}
