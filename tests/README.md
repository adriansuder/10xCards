# 🧪 Testing Guide - 10xCards

This directory contains all automated tests for the 10xCards application. This guide will help you understand the testing setup, run tests, and write new tests.

---

## 📋 Table of Contents

1. [Test Stack](#test-stack)
2. [Directory Structure](#directory-structure)
3. [Getting Started](#getting-started)
4. [Running Tests](#running-tests)
5. [Writing Unit Tests](#writing-unit-tests)
6. [Writing E2E Tests](#writing-e2e-tests)
7. [Mocking Strategies](#mocking-strategies)
8. [Coverage Reports](#coverage-reports)
9. [CI/CD Integration](#cicd-integration)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🛠️ Test Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 2.0+ | Unit and integration testing |
| **Playwright** | 1.47+ | End-to-end testing |
| **@testing-library/react** | 16.0+ | React component testing |
| **@testing-library/user-event** | 14.5+ | User interaction simulation |
| **@testing-library/jest-dom** | 6.6+ | Custom matchers |
| **jsdom** | 25.0+ | DOM simulation |
| **@vitest/coverage-v8** | 2.0+ | Code coverage |
| **@axe-core/playwright** | 4.10+ | Accessibility testing |

---

## 📁 Directory Structure

```
tests/
├── unit/                       # Unit tests
│   ├── components/            # Component tests
│   ├── hooks/                 # Custom hook tests
│   ├── services/              # Service layer tests
│   └── lib/                   # Utility function tests
├── integration/               # Integration tests
│   ├── api/                   # API endpoint tests
│   └── workflows/             # Multi-step workflow tests
├── e2e/                       # End-to-end tests
│   ├── auth/                  # Authentication flows
│   ├── flashcards/            # Flashcard CRUD operations
│   └── review/                # Review session flows
├── fixtures/                  # Test data and fixtures
│   └── testData.ts           # Centralized test data
├── setup/                     # Test configuration
│   ├── vitest.setup.ts       # Global Vitest setup
│   └── supabase.mock.ts      # Supabase mocking utilities
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** 18+ and npm 9+
2. **Supabase CLI** for local development
3. **Docker** (for Supabase local instance)

### Installation

All testing dependencies are already included in `package.json`. If you need to reinstall:

```powershell
npm install
```

### Playwright Browser Setup

Install Playwright browsers (first time only):

```powershell
npx playwright install chromium
```

---

## ▶️ Running Tests

### Quick Commands

```powershell
# Run all tests (unit + integration + e2e)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Open Vitest UI (interactive test runner)
npm run test:ui

# Open Playwright UI (interactive E2E test runner)
npm run test:e2e:ui

# Debug E2E tests (step-by-step)
npm run test:e2e:debug

# Generate E2E test code (record interactions)
npm run test:e2e:codegen
```

### Filtering Tests

Run specific test file:

```powershell
# Unit test
npx vitest tests/unit/services/flashcard.service.test.ts

# E2E test
npx playwright test tests/e2e/user-journey.spec.ts
```

Run tests matching pattern:

```powershell
# Vitest (unit/integration)
npx vitest --run --grep "createFlashcard"

# Playwright (E2E)
npx playwright test --grep "registration"
```

---

## ✍️ Writing Unit Tests

### File Naming Convention

- **Location**: `tests/unit/[category]/[filename].test.ts`
- **Naming**: `[module-name].test.ts` (e.g., `flashcard.service.test.ts`)

### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '@tests/setup/supabase.mock';
import { myFunction } from '@/lib/services/my-service';

describe('myFunction', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Setup runs before each test
    mockSupabase = createMockSupabaseClient();
  });

  it('should return expected result on success', async () => {
    // Arrange: Setup test data and mocks
    const input = { id: '123' };
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: { id: '123', name: 'Test' },
        error: null
      })
    } as any);

    // Act: Execute the function
    const result = await myFunction(mockSupabase as any, input);

    // Assert: Verify the outcome
    expect(result).toEqual({ id: '123', name: 'Test' });
    expect(mockSupabase.from).toHaveBeenCalledWith('my_table');
  });

  it('should handle errors gracefully', async () => {
    // Arrange: Setup error scenario
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any);

    // Act & Assert: Verify error handling
    await expect(myFunction(mockSupabase as any, {}))
      .rejects.toThrow('Database error');
  });
});
```

### Testing React Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly with props', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state on input change', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'test@example.com');
    
    expect(input).toHaveValue('test@example.com');
  });
});
```

### Testing Custom Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMyHook } from '@/components/hooks/useMyHook';

describe('useMyHook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useMyHook());
    
    // Trigger data fetch
    result.current.fetchData();
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });
});
```

---

## 🌐 Writing E2E Tests

### File Naming Convention

- **Location**: `tests/e2e/[feature]/[test-name].spec.ts`
- **Naming**: `[feature-name].spec.ts` (e.g., `user-journey.spec.ts`)

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('user can complete main action', async ({ page }) => {
    // Step 1: Navigate to page
    await page.goto('/my-page');
    await expect(page).toHaveTitle(/Expected Title/);

    // Step 2: Interact with elements
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Step 3: Verify outcome
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Page Object Model Pattern

Create reusable page objects:

```typescript
// tests/e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/logowanie');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/');
  }
}

// Use in test
test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await loginPage.expectLoginSuccess();
});
```

### Common Patterns

**Wait for element:**
```typescript
await page.waitForSelector('div.flashcard', { timeout: 5000 });
```

**Check if element exists:**
```typescript
const isVisible = await page.locator('text=Hello').isVisible();
```

**Take screenshot on failure:**
```typescript
test('my test', async ({ page }) => {
  try {
    // ... test steps
  } catch (error) {
    await page.screenshot({ path: 'failure.png' });
    throw error;
  }
});
```

---

## 🎭 Mocking Strategies

### Mocking Supabase Client

Use the provided mock utilities:

```typescript
import { createMockSupabaseClient } from '@tests/setup/supabase.mock';

const mockSupabase = createMockSupabaseClient();

// Mock successful query
mockSupabase.from.mockReturnValue({
  select: vi.fn().mockResolvedValue({
    data: [{ id: '1', name: 'Test' }],
    error: null
  })
} as any);

// Mock error
mockSupabase.from.mockReturnValue({
  select: vi.fn().mockResolvedValue({
    data: null,
    error: { message: 'Error' }
  })
} as any);
```

### Mocking API Responses

```typescript
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true, data: [] })
});

// Mock specific endpoint
vi.mock('@/lib/services/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}));
```

### Mocking React Context

```typescript
import { vi } from 'vitest';
import { render } from '@testing-library/react';

const mockContextValue = {
  user: { id: '123', email: 'test@example.com' },
  logout: vi.fn()
};

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockContextValue
}));
```

---

## 📊 Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`:

1. Open `coverage/index.html` in browser
2. Navigate through files to see line-by-line coverage
3. Red = uncovered, green = covered

### Coverage Thresholds

Current thresholds (configured in `vitest.config.ts`):
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

Tests will fail if coverage drops below these thresholds.

### Ignoring Files from Coverage

Add comment to skip file:

```typescript
/* istanbul ignore file */
```

Skip specific lines:

```typescript
/* istanbul ignore next */
const unreachableCode = () => { ... };
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 📝 Best Practices

### General

- ✅ Write tests before fixing bugs (TDD approach)
- ✅ One assertion per test (when possible)
- ✅ Use descriptive test names (`it('should X when Y')`)
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Keep tests independent (no shared state)
- ✅ Use factories/fixtures for test data
- ❌ Don't test implementation details
- ❌ Don't mock everything (test behavior, not code)

### Unit Tests

- Test edge cases (null, undefined, empty arrays)
- Test error handling
- Mock external dependencies (APIs, databases)
- Use `beforeEach` for common setup
- Prefer `toEqual` over `toBe` for objects

### E2E Tests

- Test critical user journeys first
- Use Page Object Model for reusability
- Add explicit waits for async operations
- Use data-testid for stable selectors
- Keep tests fast (avoid unnecessary waits)
- Run E2E tests in CI pipeline

### Accessibility Tests

```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('page is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## 🐛 Troubleshooting

### Vitest Issues

**Problem**: Tests timeout

**Solution**: Increase timeout in test

```typescript
it('slow test', { timeout: 10000 }, async () => {
  // ...
});
```

**Problem**: Module not found errors

**Solution**: Check path aliases in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@tests': path.resolve(__dirname, './tests')
  }
}
```

### Playwright Issues

**Problem**: Element not found

**Solution**: Add explicit wait

```typescript
await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
```

**Problem**: Browser not installed

**Solution**: Install browsers

```powershell
npx playwright install chromium
```

### Supabase Mocking Issues

**Problem**: TypeError: Cannot read property 'from' of undefined

**Solution**: Ensure mock is properly initialized

```typescript
const mockSupabase = createMockSupabaseClient();
// Must call from() with proper chaining
mockSupabase.from.mockReturnValue({
  select: vi.fn().mockResolvedValue({ data: [], error: null })
} as any);
```

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Test Plan](.docs/test-plan.md)
- [Project README](../README.md)

---

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass (`npm test`)
3. Check coverage (`npm run test:coverage`)
4. Add new test utilities to `setup/` if reusable
5. Document complex test scenarios

---

**Questions?** Contact the development team or open an issue.

**Happy Testing! 🎉**
