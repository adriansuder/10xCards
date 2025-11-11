import { test, expect } from '@playwright/test';

test.describe('Manual Flashcard Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/logowanie');
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', process.env.E2E_USERNAME!);
    await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[data-test-id="login-submit-button"]');
    await expect(page).toHaveURL('/', { timeout: 2000 });
  });

  test('user can create a flashcard manually', async ({ page }) => {
    // Step 1: Open the main page
    await page.goto('/');

    // Step 2: Click the "Dodaj ręcznie" tab
    await page.click('[data-test-id="manual-tab-trigger"]');

    // Step 3: Fill in the front of the flashcard
    const guidFront = `Apple-${Date.now()}`;
    const guidBack = `Jabłko-${Date.now()}`;
    await page.fill('[data-test-id="front-input"]', guidFront);

    // Step 4: Fill in the back of the flashcard
    await page.fill('[data-test-id="back-input"]', guidBack);
    // Step 5: Click the "Dodaj fiszkę" button
    await page.click('[data-test-id="add-flashcard-button"]');

    // Verify success toast
    await expect(page.locator('text=/została dodana/i')).toBeVisible({
      timeout: 5000,
    });

    await page.click('a[data-test-id="my-flashcards-nav-button"]');

    // Optional: Verify navigation or that the fields are cleared
    // For example, check if we are on the "My Flashcards" page
    await expect(page).toHaveURL('/moje-fiszki', { timeout: 10000 });

    // Verify the new flashcard is in the list
    await expect(page.locator('tr').filter({ hasText: guidFront }).filter({ hasText: guidBack })).toBeVisible();
  });
});
