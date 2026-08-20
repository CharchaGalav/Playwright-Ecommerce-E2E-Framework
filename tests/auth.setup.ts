import { test as setup, expect } from '@playwright/test';
import { AdminLoginPage } from '../page_objects/admin/AdminLoginPage';

const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await page.goto('http://localhost:9000/app/login');

  await loginPage.login('admin@test.com', 'nezuke');

  // Wait for proof login succeeded before saving state - if we saved
  // state immediately after clicking, and login failed, we'd save a
  // "logged out" session by mistake. Waiting for a dashboard-only
  // element (e.g. "Orders" nav link) confirms we're actually in.
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: adminAuthFile });
});