import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { useManualFlashcard } from '../hooks/useManualFlashcard';

interface ManualTabProps {
  onCreateSuccess: (front: string) => void;
  onError: (message: string) => void;
}

/**
 * Tab component for manually creating flashcards.
 * Allows users to input front, back, and optionally part of speech.
 */
export function ManualTab({ onCreateSuccess, onError }: ManualTabProps) {
  const errorShownRef = useRef<string | null>(null);
  
  const {
    form,
    isSubmitting,
    error,
    updateField,
    createFlashcard,
  } = useManualFlashcard();

  // Display hook error once
  useEffect(() => {
    if (error && error !== errorShownRef.current) {
      onError(error);
      errorShownRef.current = error;
    }
  }, [error, onError]);

  const isFormValid = form.front.trim().length > 0 && form.back.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      const created = await createFlashcard();
      if (created) {
        onCreateSuccess(created.front);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się utworzyć fiszki';
      onError(errorMessage);
    }
  };

  // Display hook error if exists
  if (error) {
    onError(error);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Front Field */}
        <div className="space-y-2">
          <Label htmlFor="manual-front">
            Przód fiszki <span className="text-destructive">*</span>
          </Label>
          <Input
            id="manual-front"
            value={form.front}
            onChange={(e) => updateField('front', e.target.value)}
            placeholder="np. apple"
            disabled={isSubmitting}
            required
            aria-required="true"
            aria-invalid={form.front.length > 0 && form.front.trim().length === 0}
          />
          <p className="text-xs text-muted-foreground">
            Słowo lub wyrażenie w języku obcym
          </p>
        </div>

        {/* Back Field */}
        <div className="space-y-2">
          <Label htmlFor="manual-back">
            Tył fiszki <span className="text-destructive">*</span>
          </Label>
          <Input
            id="manual-back"
            value={form.back}
            onChange={(e) => updateField('back', e.target.value)}
            placeholder="np. jabłko"
            disabled={isSubmitting}
            required
            aria-required="true"
            aria-invalid={form.back.length > 0 && form.back.trim().length === 0}
          />
          <p className="text-xs text-muted-foreground">
            Tłumaczenie lub definicja
          </p>
        </div>

        {/* Part of Speech Field */}
        <div className="space-y-2">
          <Label htmlFor="manual-pos">
            Część mowy (opcjonalnie)
          </Label>
          <Select
            id="manual-pos"
            value={form.part_of_speech || ''}
            onChange={(e) => updateField('part_of_speech', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Nie wybrano</option>
            <option value="noun">Rzeczownik</option>
            <option value="verb">Czasownik</option>
            <option value="adjective">Przymiotnik</option>
            <option value="adverb">Przysłówek</option>
            <option value="phrase">Wyrażenie</option>
            <option value="other">Inne</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            Pomaga w organizacji fiszek
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Dodawanie...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj fiszkę
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
