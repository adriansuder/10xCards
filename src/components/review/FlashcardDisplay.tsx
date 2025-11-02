import { useState } from 'react';
import type { ReviewCardDto } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Flashcard display component showing the card content.
 * Displays the front of the card, and reveals the back after clicking "Show answer".
 *
 * @param card - The flashcard to display
 * @param isAnswerRevealed - Whether the answer is currently revealed
 * @param onRevealAnswer - Callback to reveal the answer
 */
interface FlashcardDisplayProps {
  card: ReviewCardDto;
  isAnswerRevealed: boolean;
  onRevealAnswer: () => void;
}

export function FlashcardDisplay({
  card,
  isAnswerRevealed,
  onRevealAnswer,
}: FlashcardDisplayProps) {
  // Validate card data
  if (!card.front) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Błąd: Brak treści fiszki
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Front of the card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Pytanie</span>
            {card.part_of_speech && (
              <span className="text-sm font-normal text-muted-foreground">
                {card.part_of_speech}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-medium">{card.front}</p>
        </CardContent>
      </Card>

      {/* Back of the card - revealed after clicking button */}
      {isAnswerRevealed ? (
        <Card className="w-full border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Odpowiedź</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">{card.back}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={onRevealAnswer}
            size="lg"
            className="min-w-[200px]"
          >
            Pokaż odpowiedź
          </Button>
        </div>
      )}
    </div>
  );
}
