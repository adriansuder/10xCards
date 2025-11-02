/**
 * Types for the Review Session view.
 * These ViewModels extend the base DTOs from types.ts with UI-specific state.
 */

/**
 * Enum representing possible states of the review session view.
 */
export type SessionViewState =
  | 'loading' // Fetching flashcards from API
  | 'empty' // No flashcards to review
  | 'active' // Active review session
  | 'summary'; // Session summary screen

/**
 * Type representing the complete session state in the component.
 */
export type SessionState = {
  viewState: SessionViewState;
  cards: import('../../types').ReviewCardDto[];
  currentIndex: number;
  isAnswerRevealed: boolean;
  isSubmitting: boolean;
  statistics: SessionStatistics;
};

/**
 * Type representing session learning statistics.
 * Used for local session tracking (not persisted to backend).
 */
export type SessionStatistics = {
  totalReviewed: number; // Total number of reviewed cards
  knewCount: number; // Number of cards marked as "knew it"
  didntKnowCount: number; // Number of cards marked as "didn't know"
  successRate: number; // Percentage of correct answers (knewCount / totalReviewed * 100)
};

/**
 * Type representing API errors in the context of a session.
 */
export type SessionError = {
  message: string;
  type: 'fetch' | 'update' | 'unknown';
};
