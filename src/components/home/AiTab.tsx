import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { SuggestionList } from './SuggestionList';
import { useAiGeneration } from '../hooks/useAiGeneration';
import type { LanguageLevel } from '../../types';

interface AiTabProps {
  onImportSuccess: (count: number) => void;
  onError: (message: string) => void;
}

/**
 * Tab component for AI-powered flashcard generation.
 * Allows users to input text and generate flashcard suggestions using AI.
 */
export function AiTab({ onImportSuccess, onError }: AiTabProps) {
  const [text, setText] = useState('');
  const [level, setLevel] = useState<Extract<LanguageLevel, 'b1' | 'b2' | 'c1'>>('b2');
  const errorShownRef = useRef<string | null>(null);
  
  const {
    suggestions,
    isGenerating,
    isImporting,
    error,
    generate,
    importFlashcards,
    updateSuggestion,
    removeSuggestion,
  } = useAiGeneration();

  // Display hook error once
  useEffect(() => {
    if (error && error !== errorShownRef.current) {
      onError(error);
      errorShownRef.current = error;
    }
  }, [error, onError]);

  const characterCount = text.length;
  const maxCharacters = 2000;
  const isTextValid = text.trim().length > 0 && text.length <= maxCharacters;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTextValid) {
      return;
    }

    await generate({ text: text.trim(), level });
  };

  const handleImport = async () => {
    try {
      const generatedCount = suggestions.length;
      await importFlashcards({
        generatedCount,
        importedCount: suggestions.length,
      });
      onImportSuccess(suggestions.length);
      // Clear text after successful import
      setText('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaimportować fiszek';
      onError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="ai-text">
            Wklej tekst do analizy
          </Label>
          <Textarea
            id="ai-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wklej tutaj tekst w języku obcym, który chcesz przekształcić w fiszki..."
            className="min-h-[200px] resize-y"
            maxLength={maxCharacters}
            disabled={isGenerating}
            aria-describedby="character-count"
          />
          <div className="flex items-center justify-between text-xs">
            <span
              id="character-count"
              className={characterCount > maxCharacters ? 'text-destructive' : 'text-muted-foreground'}
            >
              {characterCount} / {maxCharacters} znaków
            </span>
            {characterCount > maxCharacters && (
              <span className="text-destructive">
                Przekroczono limit znaków
              </span>
            )}
          </div>
        </div>

        {/* Level Select */}
        <div className="space-y-2">
          <Label htmlFor="ai-level">
            Poziom językowy
          </Label>
          <Select
            id="ai-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as Extract<LanguageLevel, 'b1' | 'b2' | 'c1'>)}
            disabled={isGenerating}
          > 
            <option value="a1">A1 - Początkujący</option>
            <option value="a2">A2 - Podstawowy</option>
            <option value="b1">B1 - Średnio zaawansowany niższy</option>
            <option value="b2">B2 - Średnio zaawansowany wyższy</option>
            <option value="c1">C1 - Zaawansowany</option>
            <option value="c2">C2 - Biegły</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            Wybierz poziom trudności generowanych fiszek
          </p>
        </div>

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={!isTextValid || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generowanie...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generuj fiszki z AI
            </>
          )}
        </Button>
      </form>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Wygenerowane propozycje
            </h3>
            <span className="text-sm text-muted-foreground">
              {suggestions.length} {suggestions.length === 1 ? 'fiszka' : 'fiszek'}
            </span>
          </div>
          <SuggestionList
            suggestions={suggestions}
            onUpdate={updateSuggestion}
            onRemove={removeSuggestion}
            onImport={handleImport}
            isImporting={isImporting}
          />
        </div>
      )}
    </div>
  );
}
