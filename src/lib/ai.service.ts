import { AiSuggestion } from '../types';

/**
 * Generates flashcard suggestions based on the provided text and language level
 * by communicating with an external AI service.
 *
 * @param text The source text to analyze for flashcard generation.
 * @param level The target language level for the generated flashcards.
 * @returns A promise that resolves to an array of AI-generated flashcard suggestions.
 * @throws An error if the communication with the AI service fails.
 */
export async function generateFlashcardSuggestions(
  text: string,
  level: string
): Promise<AiSuggestion[]> {
  // TODO: Implement the logic for creating a prompt, communicating with the AI API (e.g., OpenAI),
  // parsing the response, and handling errors.

  // For now, returning mock data to satisfy the structure.
  console.log(`Generating suggestions for text: "${text}" at level: ${level}`);

  // Mock implementation
  const mockSuggestions: AiSuggestion[] = [
    {
      id: crypto.randomUUID(),
      front: 'quick',
      back: 'szybki',
    },
    {
      id: crypto.randomUUID(),
      front: 'lazy',
      back: 'leniwy',
    },
  ];

  return Promise.resolve(mockSuggestions);
}
