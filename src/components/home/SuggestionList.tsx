import { Button } from '../ui/button';
import { SuggestionItem } from './SuggestionItem';
import type { AiSuggestionViewModel } from '../../types';

interface SuggestionListProps {
  suggestions: AiSuggestionViewModel[];
  onUpdate: (id: string, updates: Partial<Pick<AiSuggestionViewModel, 'front' | 'back' | 'tempPartOfSpeech'>>) => void;
  onRemove: (id: string) => void;
  onImport: () => void;
  isImporting: boolean;
}

/**
 * Component displaying a list of AI-generated flashcard suggestions.
 * Includes import button with dynamic label based on suggestion count.
 */
export function SuggestionList({
  suggestions,
  onUpdate,
  onRemove,
  onImport,
  isImporting,
}: SuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const buttonLabel = suggestions.length === 1 
    ? 'Dodaj 1 fiszkę' 
    : `Dodaj ${suggestions.length} fiszek`;

  return (
    <div className="space-y-4">
      {/* Suggestions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Import Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={onImport}
          disabled={isImporting}
          size="lg"
          className="min-w-[200px]"
          aria-label={buttonLabel}
        >
          {isImporting ? 'Importowanie...' : buttonLabel}
        </Button>
      </div>
    </div>
  );
}
