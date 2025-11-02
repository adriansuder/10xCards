import { useState } from 'react';
import type {
  GenerateSuggestionsCommand,
  GenerateSuggestionsResponseDto,
  ImportFlashcardsCommand,
  ImportFlashcardsResponseDto,
  AiSuggestionViewModel,
  AiSuggestion,
} from '../../types';

interface UseAiGenerationReturn {
  suggestions: AiSuggestionViewModel[];
  isGenerating: boolean;
  isImporting: boolean;
  error: string | null;
  generate: (command: GenerateSuggestionsCommand) => Promise<void>;
  importFlashcards: (metrics: { generatedCount: number; importedCount: number }) => Promise<void>;
  updateSuggestion: (id: string, updates: Partial<Pick<AiSuggestionViewModel, 'front' | 'back' | 'tempPartOfSpeech'>>) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
}

/**
 * Custom hook for managing AI flashcard generation and import functionality.
 * Handles API calls, state management, and error handling for the AI generation flow.
 */
export function useAiGeneration(): UseAiGenerationReturn {
  const [suggestions, setSuggestions] = useState<AiSuggestionViewModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converts AiSuggestion to AiSuggestionViewModel with editing state.
   */
  const toViewModel = (suggestion: AiSuggestion): AiSuggestionViewModel => ({
    ...suggestion,
    isEditing: false,
    tempFront: suggestion.front,
    tempBack: suggestion.back,
    tempPartOfSpeech: null,
  });

  /**
   * Generate flashcard suggestions from AI based on provided text and level.
   */
  const generate = async (command: GenerateSuggestionsCommand): Promise<void> => {
    if (!command.text.trim()) {
      setError('Tekst nie może być pusty');
      return;
    }

    if (command.text.length > 2000) {
      setError('Tekst nie może przekraczać 2000 znaków');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 502) {
          throw new Error('Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.');
        }
        const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd' }));
        throw new Error(errorData.message || 'Nie udało się wygenerować fiszek');
      }

      const data: GenerateSuggestionsResponseDto = await response.json();
      setSuggestions(data.suggestions.map(toViewModel));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Import approved flashcards to the database.
   */
  const importFlashcards = async (metrics: { generatedCount: number; importedCount: number }): Promise<void> => {
    if (suggestions.length === 0) {
      setError('Brak fiszek do zaimportowania');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const flashcardsToImport = suggestions.map(s => ({
        front: s.front,
        back: s.back,
        part_of_speech: s.tempPartOfSpeech || null,
      }));

      const command: ImportFlashcardsCommand = {
        flashcards: flashcardsToImport,
        metrics: {
          generatedCount: metrics.generatedCount,
          importedCount: flashcardsToImport.length,
        },
      };

      const response = await fetch('/api/ai/import-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd' }));
        throw new Error(errorData.message || 'Nie udało się zaimportować fiszek');
      }

      const data: ImportFlashcardsResponseDto = await response.json();
      
      // Clear suggestions after successful import
      setSuggestions([]);
      
      // Success handled by parent component via toast
      return;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      throw err; // Re-throw to allow parent to handle toast
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Update a suggestion with new values (used during inline editing).
   */
  const updateSuggestion = (id: string, updates: Partial<Pick<AiSuggestionViewModel, 'front' | 'back' | 'tempPartOfSpeech'>>): void => {
    setSuggestions(prev =>
      prev.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    );
  };

  /**
   * Remove a suggestion from the list.
   */
  const removeSuggestion = (id: string): void => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  /**
   * Clear all suggestions.
   */
  const clearSuggestions = (): void => {
    setSuggestions([]);
    setError(null);
  };

  return {
    suggestions,
    isGenerating,
    isImporting,
    error,
    generate,
    importFlashcards,
    updateSuggestion,
    removeSuggestion,
    clearSuggestions,
  };
}
