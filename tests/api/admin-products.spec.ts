import { test, expect } from "@playwright/test";

test.describe("Admin API - authenticated product access", () => {
  test("GET /admin/products succeeds for an authenticated admin session", async ({
    request,
  }) => {
    // The `api` project's storageState (playwright/.auth/admin.json)
    // already carries the admin session cookie saved by auth.setup.ts,
    // so this request fixture is authenticated without logging in again
    // - proves the login-once pattern works for API calls too, not just
    // the browser.
    const response = await request.get("/admin/products", {
      params: { limit: 5 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.products)).toBeTruthy();
  });
});