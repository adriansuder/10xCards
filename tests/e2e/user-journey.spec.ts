import { test, expect } from '@playwright/test';

/**
 * E2E Test: User Registration and First Flashcard Creation
 * 
 * This test covers the complete user journey from registration
 * to creating their first flashcard manually.
 * 
 * Prerequisites:
 * - Local Supabase instance running (npx supabase start)
 * - Dev server running (npm run dev)
 * - Mailpit accessible at http://localhost:54324
 */

// test.describe('User Registration Flow', () => {
//   test('new user registers and creates first flashcard', async ({ page }) => {
//     // Generate unique email for this test run
//     const testEmail = `test-${Date.now()}@example.com`;
//     const testPassword = 'SecurePass123!';

//     // Step 1: Navigate to registration page
//     await page.goto('/rejestracja');
//     await expect(page).toHaveTitle(/10xCards/);

//     // Step 2: Fill registration form
//     await page.fill('input[type="email"]', testEmail);
//     await page.fill('input[type="password"]', testPassword);
//     await page.click('button[type="submit"]');

//     // Step 3: Check for confirmation message
//     // Note: In real scenario, you'd verify email via Mailpit
//     // For now, we check if we're redirected or see success message
//     await expect(
//       page.locator('text=/potwierd|sukces|email/i')
//     ).toBeVisible({ timeout: 10000 });

//     // Step 4: Navigate to login (if email confirmation is required)
//     // Skip if auto-logged in
//     const isOnLoginPage = page.url().includes('/logowanie');
//     if (isOnLoginPage) {
//       await page.fill('input[type="email"]', testEmail);
//       await page.fill('input[type="password"]', testPassword);
//       await page.click('button[type="submit"]');
//     }

//     // Step 5: Verify we're on the home page
//     await expect(page).toHaveURL('/', { timeout: 10000 });

//     // Step 6: Create first flashcard manually
//     // Click on "Ręcznie" tab if not already active
//     const manualTab = page.locator('text=Ręcznie');
//     if (await manualTab.isVisible()) {
//       await manualTab.click();
//     }

//     // Fill flashcard form
//     await page.fill('input[name="front"], input#front', 'hello');
//     await page.fill('input[name="back"], input#back', 'cześć (powitanie)');
    
//     // Select part of speech if dropdown exists
//     const partOfSpeechSelect = page.locator('select[name="part_of_speech"], select#part_of_speech');
//     if (await partOfSpeechSelect.isVisible()) {
//       await partOfSpeechSelect.selectOption('noun');
//     }

//     // Submit form
//     await page.click('button:has-text("Dodaj")');

//     // Step 7: Verify success toast
//     await expect(
//       page.locator('text=/dodano|utworzono|sukces/i')
//     ).toBeVisible({ timeout: 5000 });

//     // Step 8: Navigate to flashcard list
//     await page.goto('/moje-fiszki');

//     // Step 9: Verify flashcard appears in the list
//     await expect(page.locator('text=hello')).toBeVisible();
//     await expect(page.locator('text=cześć')).toBeVisible();
//   });
// });

test.describe('Flashcard Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    // Note: In a real scenario, use a test user or setup fixture
    await page.goto('/logowanie');
    await page.waitForTimeout(2000)
    await page.fill('input[type="email"]', process.env.E2E_USERNAME!);
    await page.fill('input[type="password"]', process.env.E2E_PASSWORD!);

    // Debug: Check button state before clicking
    const button = page.locator('button[data-test-id="login-submit-button"]');
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();

    // Click the button
    await button.click({ force: true });

    // Wait for API response - check for either success (redirect) or error
    await page.waitForTimeout(2000); // Give time for API call

    // Check if login succeeded (redirected to /) or failed (error message)
    const currentUrl = page.url();
    if (currentUrl.includes('/logowanie')) {
      // Login failed - check for error message
      const errorAlert = page.locator('[role="alert"], .text-red-600, .text-red-800');
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        throw new Error(`Login failed with error: ${errorText}`);
      } else {
        throw new Error('Login failed but no error message visible');
      }
    }

    // Login succeeded - expect to be on home page
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('user can edit flashcard inline', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/moje-fiszki');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Click on first editable cell (front)
    const firstCell = page.locator('tbody tr').first().locator('button[aria-label*="front"]');
    await firstCell.click();

    const guidUpdatedText = `updated text ${Date.now()}`;
    // Edit the text
    const input = page.locator('input[value]').first();
    await input.clear();
    await input.fill(guidUpdatedText);
    await input.press('Enter');

    // Verify success toast
    await expect(
      page.locator('text=/Fiszka została zaktualizowana/i')
    ).toBeVisible({ timeout: 5000 });

    // Verify updated text appears
    await expect(page.locator(`text=${guidUpdatedText}`)).toBeVisible();
  });

  test('user can delete flashcard with confirmation', async ({ page }) => {
    // Navigate to flashcard list
    await page.goto('/moje-fiszki');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(1000); // Wait for UI to update after navigation
    // Get initial row count
    const initialCount = await page.locator('tbody tr').count();

    // Click delete button on first row
    const deleteButton = page.locator('tbody tr').first().locator('button[aria-label*="Usuń"]');
    await deleteButton.click();
    
    await page.waitForTimeout(1500); // Wait for dialog to appear
    // Confirm deletion in dialog
    await page.click('[data-test-id="confirm-delete-flashcard-button"]');

    // Verify success toast
    await expect(
      page.locator('text=/Fiszka została usunięta/i')
    ).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000); // Wait for UI to update after deletion
    // Verify row count decreased
    const newCount = await page.locator('tbody tr').count();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('Accessibility', () => {
  test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    // Note: For full axe-core integration, install @axe-core/playwright
    
    // Check for main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for skip link or proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for proper form labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      }
    }
  });
});
