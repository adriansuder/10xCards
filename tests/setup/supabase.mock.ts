import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a mock Supabase client for testing
 * 
 * Usage:
 * ```typescript
 * import { createMockSupabaseClient } from '@tests/setup/supabase.mock';
 * 
 * const mockSupabase = createMockSupabaseClient({
 *   from: vi.fn().mockReturnValue({
 *     select: vi.fn().mockResolvedValue({ data: [...], error: null })
 *   })
 * });
 * ```
 */
export function createMockSupabaseClient(overrides: any = {}): SupabaseClient {
  const defaultMock = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'new-user-id' }, session: null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'token' } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    ...defaultMock,
    ...overrides,
  } as any as SupabaseClient;
}

/**
 * Creates a mock authenticated user for testing
 */
export function createMockUser(overrides: any = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates mock flashcard data for testing
 */
export function createMockFlashcard(overrides: any = {}) {
  return {
    id: 'flashcard-123',
    user_id: 'test-user-id',
    front: 'hello',
    back: 'cześć (powitanie)',
    part_of_speech: 'noun',
    ai_generated: false,
    flashcard_language_level: null,
    leitner_box: 1,
    review_due_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
