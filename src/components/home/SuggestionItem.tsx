import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import type { AiSuggestionViewModel } from '../../types';

interface SuggestionItemProps {
  suggestion: AiSuggestionViewModel;
  onUpdate: (id: string, updates: Partial<Pick<AiSuggestionViewModel, 'front' | 'back' | 'tempPartOfSpeech'>>) => void;
  onRemove: (id: string) => void;
}

/**
 * Component representing a single AI-generated flashcard suggestion.
 * Supports inline editing of front, back, and part_of_speech fields.
 */
export function SuggestionItem({ suggestion, onUpdate, onRemove }: SuggestionItemProps) {
  const [isEditingFront, setIsEditingFront] = useState(false);
  const [isEditingBack, setIsEditingBack] = useState(false);
  const [tempFront, setTempFront] = useState(suggestion.front);
  const [tempBack, setTempBack] = useState(suggestion.back);

  const handleFrontBlur = () => {
    setIsEditingFront(false);
    if (tempFront.trim() && tempFront !== suggestion.front) {
      onUpdate(suggestion.id, { front: tempFront.trim() });
    } else {
      setTempFront(suggestion.front);
    }
  };

  const handleBackBlur = () => {
    setIsEditingBack(false);
    if (tempBack.trim() && tempBack !== suggestion.back) {
      onUpdate(suggestion.id, { back: tempBack.trim() });
    } else {
      setTempBack(suggestion.back);
    }
  };

  const handleFrontKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setTempFront(suggestion.front);
      setIsEditingFront(false);
    }
  };

  const handleBackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setTempBack(suggestion.back);
      setIsEditingBack(false);
    }
  };

  const handlePartOfSpeechChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    onUpdate(suggestion.id, { tempPartOfSpeech: value });
  };

  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="space-y-3">
        {/* Front Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`front-${suggestion.id}`} className="text-xs font-medium text-muted-foreground">
            Przód fiszki
          </Label>
          {isEditingFront ? (
            <Input
              id={`front-${suggestion.id}`}
              value={tempFront}
              onChange={(e) => setTempFront(e.target.value)}
              onBlur={handleFrontBlur}
              onKeyDown={handleFrontKeyDown}
              autoFocus
              className="font-medium"
              aria-label="Edytuj przód fiszki"
            />
          ) : (
            <button
              onClick={() => setIsEditingFront(true)}
              className={cn(
                "w-full rounded-md border border-transparent px-3 py-2 text-left text-sm font-medium transition-colors",
                "hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label="Kliknij aby edytować przód fiszki"
            >
              {suggestion.front}
            </button>
          )}
        </div>

        {/* Back Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`back-${suggestion.id}`} className="text-xs font-medium text-muted-foreground">
            Tył fiszki
          </Label>
          {isEditingBack ? (
            <Input
              id={`back-${suggestion.id}`}
              value={tempBack}
              onChange={(e) => setTempBack(e.target.value)}
              onBlur={handleBackBlur}
              onKeyDown={handleBackKeyDown}
              autoFocus
              className="font-medium"
              aria-label="Edytuj tył fiszki"
            />
          ) : (
            <button
              onClick={() => setIsEditingBack(true)}
              className={cn(
                "w-full rounded-md border border-transparent px-3 py-2 text-left text-sm font-medium transition-colors",
                "hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label="Kliknij aby edytować tył fiszki"
            >
              {suggestion.back}
            </button>
          )}
        </div>

        {/* Part of Speech Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`pos-${suggestion.id}`} className="text-xs font-medium text-muted-foreground">
            Część mowy (opcjonalnie)
          </Label>
          <Select
            id={`pos-${suggestion.id}`}
            // Prefer the editable temporary value when present, otherwise fall back to the saved value.
            value={(suggestion.tempPartOfSpeech ?? suggestion.part_of_speech ?? '') as string}
            onChange={handlePartOfSpeechChange}
            aria-label="Wybierz część mowy"
          >
            <option value="">Nie wybrano</option>
            <option value="noun">Rzeczownik</option>
            <option value="verb">Czasownik</option>
            <option value="adjective">Przymiotnik</option>
            <option value="adverb">Przysłówek</option>
            <option value="phrase">Wyrażenie</option>
            <option value="other">Inne</option>
          </Select>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onRemove(suggestion.id)}
        aria-label="Usuń propozycję"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
