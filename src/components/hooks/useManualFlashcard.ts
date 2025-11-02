import { useState } from 'react';
import type {
  CreateFlashcardCommand,
  CreatedFlashcardDto,
  ManualFormViewModel,
} from '../../types';

interface UseManualFlashcardReturn {
  form: ManualFormViewModel;
  isSubmitting: boolean;
  error: string | null;
  updateField: (field: keyof Omit<ManualFormViewModel, 'isSubmitting'>, value: string) => void;
  createFlashcard: () => Promise<CreatedFlashcardDto | null>;
  resetForm: () => void;
}

const initialFormState: ManualFormViewModel = {
  front: '',
  back: '',
  part_of_speech: null,
  isSubmitting: false,
};

/**
 * Custom hook for managing manual flashcard creation.
 * Handles form state, validation, API calls, and error handling.
 */
export function useManualFlashcard(): UseManualFlashcardReturn {
  const [form, setForm] = useState<ManualFormViewModel>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update a specific form field.
   */
  const updateField = (field: keyof Omit<ManualFormViewModel, 'isSubmitting'>, value: string): void => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (error) {
      setError(null);
    }
  };

  /**
   * Validate form data before submission.
   */
  const validateForm = (): boolean => {
    if (!form.front.trim()) {
      setError('Pole "Front" nie może być puste');
      return false;
    }

    if (!form.back.trim()) {
      setError('Pole "Back" nie może być puste');
      return false;
    }

    return true;
  };

  /**
   * Create a new flashcard via API.
   */
  const createFlashcard = async (): Promise<CreatedFlashcardDto | null> => {
    if (!validateForm()) {
      return null;
    }

    setForm(prev => ({ ...prev, isSubmitting: true }));
    setError(null);

    try {
      const command: CreateFlashcardCommand = {
        front: form.front.trim(),
        back: form.back.trim(),
        part_of_speech: form.part_of_speech?.trim() || undefined,
      };

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd' }));
        throw new Error(errorData.message || 'Nie udało się utworzyć fiszki');
      }

      const createdFlashcard: CreatedFlashcardDto = await response.json();
      
      // Reset form after successful creation
      resetForm();
      
      return createdFlashcard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      throw err; // Re-throw to allow parent to handle toast
    } finally {
      setForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  /**
   * Reset form to initial state.
   */
  const resetForm = (): void => {
    setForm(initialFormState);
    setError(null);
  };

  return {
    form,
    isSubmitting: form.isSubmitting,
    error,
    updateField,
    createFlashcard,
    resetForm,
  };
}
