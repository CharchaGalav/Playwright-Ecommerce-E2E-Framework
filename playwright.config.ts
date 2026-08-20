import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 150000,
  expect: { timeout: 10000 },

  use: {
    // REMOVE baseURL from here - each project now sets its own instead,
    // since a single global baseURL doesn't work once you have two
    // apps (storefront + admin) on different ports.
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'http://localhost:9000', // Medusa backend serves both /store and /admin from here
        storageState: 'playwright/.auth/admin.json', // gives admin-products.spec.ts an authenticated session; store-products.spec.ts doesn't need it but ignores it harmlessly
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'storefront', 
      testDir: './tests/storefront', // NEW - scopes this project to only storefront test files
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8000/dk', // moved here from the old top-level `use`
        launchOptions: { slowMo: 2000 },
      },
    },
    {
      name: 'cross-app',
      testDir: './tests/cross-app',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:9000', // starts on admin side
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'], // remember to re-enable this now that admin work is stabilizing
    },
    

    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      name: 'admin',
      testDir: './tests/admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:9000',
        storageState: 'playwright/.auth/admin.json',
        launchOptions: { slowMo: 2000 },
      },
      dependencies: ['setup'],
    },
  ],
});