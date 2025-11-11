import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

/**
 * Playwright E2E Test Configuration for 10xCards
 * 
 * Configured with:
 * - Chromium/Desktop Chrome only (as per guidelines)
 * - Local development server (http://localhost:4321)
 * - Trace on first retry for debugging
 * - Screenshots on failure
 * - Environment variables loaded from .env.test
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:4321',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Browser viewport
    viewport: { width: 1280, height: 720 },
    
    // Emulate user locale and timezone
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  },
  
  // Configure projects for major browsers (only Chromium as per guidelines)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable browser context options for isolation
        contextOptions: {
          // Ignore HTTPS errors for local development
          ignoreHTTPSErrors: true,
        },
      },
    },
  ],
  
  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  
  // Output directory for test artifacts
  outputDir: 'test-results/',
});
