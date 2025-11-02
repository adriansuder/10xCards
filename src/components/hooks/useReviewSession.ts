import { useState, useEffect, useCallback } from 'react';
import type { ReviewSessionDto, ReviewCardDto, UpdateCardReviewDto } from '../../types';
import type { SessionState, SessionError } from '../review/types';
import { toast } from 'sonner';

/**
 * Custom hook for managing the review session state and logic.
 * Encapsulates all business logic for the learning session.
 *
 * Responsibilities:
 * - Fetching flashcards to review from API on initialization
 * - Managing view state (loading, empty, active, summary)
 * - Managing current card index
 * - Handling answer reveal
 * - Submitting card review to API
 * - Moving to next card or summary screen
 * - Calculating local session statistics
 * - Error handling and retry logic
 */
export function useReviewSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    viewState: 'loading',
    cards: [],
    currentIndex: 0,
    isAnswerRevealed: false,
    isSubmitting: false,
    statistics: {
      totalReviewed: 0,
      knewCount: 0,
      didntKnowCount: 0,
      successRate: 0,
    },
  });

  const [error, setError] = useState<SessionError | null>(null);

  /**
   * Initialize the review session by fetching cards from API.
   */
  const initializeSession = useCallback(async () => {
    try {
      setSessionState((prev) => ({ ...prev, viewState: 'loading' }));
      setError(null);

      const response = await fetch('/api/review/session?limit=50');

      // Handle authentication errors
      if (response.status === 401) {
        toast.error('Twoja sesja wygasła. Zaloguj się ponownie.');
        window.location.href = '/logowanie';
        return;
      }

      // Handle server errors
      if (!response.ok) {
        throw new Error('Nie udało się pobrać fiszek do powtórki.');
      }

      const data: ReviewSessionDto = await response.json();

      // Validate response structure
      if (!Array.isArray(data.cards)) {
        throw new Error('Otrzymano nieprawidłowe dane z serwera.');
      }

      // Check if there are any cards to review
      if (data.cards.length === 0) {
        setSessionState((prev) => ({ ...prev, viewState: 'empty' }));
        return;
      }

      // Start active session
      setSessionState((prev) => ({
        ...prev,
        viewState: 'active',
        cards: data.cards,
        currentIndex: 0,
        isAnswerRevealed: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.';
      setError({
        message: errorMessage,
        type: 'fetch',
      });
      toast.error(errorMessage);
      setSessionState((prev) => ({ ...prev, viewState: 'loading' }));
    }
  }, []);

  /**
   * Initialize session on component mount.
   */
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  /**
   * Reveal the answer of the current card.
   */
  const revealAnswer = useCallback(() => {
    setSessionState((prev) => ({
      ...prev,
      isAnswerRevealed: true,
    }));
  }, []);

  /**
   * Submit the review for the current card and move to next card or summary.
   *
   * @param knewIt - Whether the user knew the answer
   */
  const submitReview = useCallback(
    async (knewIt: boolean) => {
      const currentCard = sessionState.cards[sessionState.currentIndex];

      if (!currentCard) {
        toast.error('Nie znaleziono aktualnej fiszki.');
        return;
      }

      try {
        setSessionState((prev) => ({ ...prev, isSubmitting: true }));

        const payload: UpdateCardReviewDto = {
          flashcardId: currentCard.id,
          knewIt,
        };

        const response = await fetch('/api/review/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        // Handle authentication errors
        if (response.status === 401) {
          toast.error('Twoja sesja wygasła. Zaloguj się ponownie.');
          window.location.href = '/logowanie';
          return;
        }

        // Handle not found errors - skip this card
        if (response.status === 404) {
          toast.error('Fiszka nie została znaleziona. Przechodzę do kolejnej.');
          moveToNextCard(knewIt, false); // Don't count this card
          return;
        }

        // Handle validation errors
        if (response.status === 400) {
          toast.error('Błąd walidacji danych. Spróbuj ponownie.');
          setSessionState((prev) => ({ ...prev, isSubmitting: false }));
          return;
        }

        // Handle server errors
        if (!response.ok) {
          throw new Error('Nie udało się zapisać odpowiedzi.');
        }

        // Success - move to next card with statistics update
        moveToNextCard(knewIt, true);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Nie udało się zapisać odpowiedzi. Spróbuj ponownie.';
        toast.error(errorMessage);
        setSessionState((prev) => ({ ...prev, isSubmitting: false }));
        setError({
          message: errorMessage,
          type: 'update',
        });
      }
    },
    [sessionState.cards, sessionState.currentIndex]
  );

  /**
   * Move to the next card or show summary screen.
   *
   * @param knewIt - Whether the user knew the answer
   * @param countCard - Whether to count this card in statistics
   */
  const moveToNextCard = useCallback(
    (knewIt: boolean, countCard: boolean) => {
      setSessionState((prev) => {
        const newStatistics = { ...prev.statistics };

        // Update statistics if card should be counted
        if (countCard) {
          newStatistics.totalReviewed += 1;
          if (knewIt) {
            newStatistics.knewCount += 1;
          } else {
            newStatistics.didntKnowCount += 1;
          }
          newStatistics.successRate =
            newStatistics.totalReviewed > 0
              ? Math.round((newStatistics.knewCount / newStatistics.totalReviewed) * 100)
              : 0;
        }

        const nextIndex = prev.currentIndex + 1;
        const isLastCard = nextIndex >= prev.cards.length;

        // If last card, show summary
        if (isLastCard) {
          return {
            ...prev,
            viewState: 'summary',
            isSubmitting: false,
            statistics: newStatistics,
          };
        }

        // Otherwise, move to next card
        return {
          ...prev,
          currentIndex: nextIndex,
          isAnswerRevealed: false,
          isSubmitting: false,
          statistics: newStatistics,
        };
      });
    },
    []
  );

  /**
   * End the session and redirect to home page.
   */
  const endSession = useCallback(() => {
    window.location.href = '/';
  }, []);

  return {
    sessionState,
    error,
    initializeSession,
    revealAnswer,
    submitReview,
    endSession,
  };
}
