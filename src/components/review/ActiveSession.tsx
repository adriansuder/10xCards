import type { ReviewCardDto } from '../../types';
import { SessionProgress } from './SessionProgress';
import { FlashcardDisplay } from './FlashcardDisplay';
import { ReviewActions } from './ReviewActions';

/**
 * Active session component managing the active review session.
 * Displays the current flashcard, progress, and review actions.
 *
 * @param currentCard - The current flashcard to display
 * @param currentIndex - Current card index (0-based)
 * @param totalCards - Total number of cards in the session
 * @param isAnswerRevealed - Whether the answer is currently revealed
 * @param isSubmitting - Whether a review is currently being submitted
 * @param onRevealAnswer - Callback to reveal the answer
 * @param onSubmitReview - Callback to submit the review
 */
interface ActiveSessionProps {
  currentCard: ReviewCardDto;
  currentIndex: number;
  totalCards: number;
  isAnswerRevealed: boolean;
  isSubmitting: boolean;
  onRevealAnswer: () => void;
  onSubmitReview: (knewIt: boolean) => Promise<void>;
}

export function ActiveSession({
  currentCard,
  currentIndex,
  totalCards,
  isAnswerRevealed,
  isSubmitting,
  onRevealAnswer,
  onSubmitReview,
}: ActiveSessionProps) {
  // Validate props
  if (!currentCard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-center text-muted-foreground">
          Błąd: Nie znaleziono aktualnej fiszki
        </p>
      </div>
    );
  }

  if (currentIndex < 0 || currentIndex >= totalCards) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-center text-muted-foreground">
          Błąd: Nieprawidłowy indeks karty
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Progress indicator */}
      <SessionProgress currentIndex={currentIndex} totalCards={totalCards} />

      {/* Flashcard display */}
      <FlashcardDisplay
        card={currentCard}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={onRevealAnswer}
      />

      {/* Review actions - only visible after answer is revealed */}
      {isAnswerRevealed && (
        <ReviewActions
          isSubmitting={isSubmitting}
          onSubmitReview={onSubmitReview}
        />
      )}
    </div>
  );
}
