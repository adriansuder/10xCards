import { useReviewSession } from '../hooks/useReviewSession';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ActiveSession } from './ActiveSession';
import { SessionSummary } from './SessionSummary';
import { Button } from '../ui/button';

/**
 * Main React container managing the entire review session state.
 * Orchestrates the flow between cards, API communication, and state transitions
 * between different views (loading, empty, active, summary).
 *
 * This is the root component hydrated on the Astro page.
 */
export function ReviewSessionContainer() {
  const {
    sessionState,
    error,
    initializeSession,
    revealAnswer,
    submitReview,
    endSession,
  } = useReviewSession();

  const { viewState, cards, currentIndex, isAnswerRevealed, isSubmitting, statistics } =
    sessionState;

  // Loading state
  if (viewState === 'loading') {
    // Show retry button if there was an error during initialization
    if (error?.type === 'fetch') {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={initializeSession} size="lg">
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      );
    }

    return <LoadingState />;
  }

  // Empty state - no flashcards to review
  if (viewState === 'empty') {
    return <EmptyState />;
  }

  // Summary state - session completed
  if (viewState === 'summary') {
    return <SessionSummary statistics={statistics} />;
  }

  // Active session state
  const currentCard = cards[currentIndex];

  return (
    <ActiveSession
      currentCard={currentCard}
      currentIndex={currentIndex}
      totalCards={cards.length}
      isAnswerRevealed={isAnswerRevealed}
      isSubmitting={isSubmitting}
      onRevealAnswer={revealAnswer}
      onSubmitReview={submitReview}
    />
  );
}
