import type { FlashcardListItemDto, AiSuggestion, ReviewCardDto } from '../../src/types';

/**
 * Test fixtures for 10xCards application
 * 
 * Provides reusable test data for consistent testing across the application.
 */

export const testUsers = {
  validUser: {
    id: 'user-valid-123',
    email: 'valid@example.com',
    password: 'SecurePass123!',
  },
  anotherUser: {
    id: 'user-another-456',
    email: 'another@example.com',
    password: 'AnotherPass123!',
  },
};

export const testFlashcards: FlashcardListItemDto[] = [
  {
    id: 'flash-001',
    front: 'hello',
    back: 'cześć (powitanie)',
    part_of_speech: 'noun',
    leitner_box: 1,
    review_due_at: new Date('2025-01-01').toISOString(),
    created_at: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'flash-002',
    front: 'goodbye',
    back: 'do widzenia (pożegnanie)',
    part_of_speech: 'phrase',
    leitner_box: 2,
    review_due_at: new Date('2025-01-02').toISOString(),
    created_at: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'flash-003',
    front: 'run',
    back: 'biegać (przemieszczać się szybko)',
    part_of_speech: 'verb',
    leitner_box: 1,
    review_due_at: new Date('2025-01-01').toISOString(),
    created_at: new Date('2024-12-02').toISOString(),
  },
];

export const testAiSuggestions: AiSuggestion[] = [
  {
    id: 'ai-001',
    front: 'quick',
    back: 'szybki (poruszający się z dużą prędkością)',
    part_of_speech: 'adjective',
  },
  {
    id: 'ai-002',
    front: 'fox',
    back: 'lis (zwierzę z rodziny psowatych)',
    part_of_speech: 'noun',
  },
  {
    id: 'ai-003',
    front: 'jump',
    back: 'skakać (odbijać się od podłoża)',
    part_of_speech: 'verb',
  },
];

export const testReviewCards: ReviewCardDto[] = [
  {
    id: 'flash-001',
    front: 'hello',
    back: 'cześć (powitanie)',
    part_of_speech: 'noun',
  },
  {
    id: 'flash-003',
    front: 'run',
    back: 'biegać (przemieszczać się szybko)',
    part_of_speech: 'verb',
  },
];

export const testProfiles = {
  defaultProfile: {
    id: 'user-valid-123',
    default_ai_level: 'b2' as const,
    created_at: new Date('2024-12-01').toISOString(),
    updated_at: new Date('2024-12-01').toISOString(),
  },
};

export const apiEndpoints = {
  flashcards: '/api/flashcards',
  flashcardById: (id: string) => `/api/flashcards/${id}`,
  generateSuggestions: '/api/ai/generate-suggestions',
  importFlashcards: '/api/ai/import-flashcards',
  reviewSession: '/api/review/session',
  updateReview: '/api/review/update',
  profile: '/api/profile',
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
};
