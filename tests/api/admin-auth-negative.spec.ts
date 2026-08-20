import { test, expect, request } from "@playwright/test";

test.describe("Admin API - security / auth enforcement (8.7)", () => {
  test("GET /admin/products is rejected without authentication", async () => {
    // Deliberately create a FRESH request context here instead of using
    // the ambient `request` fixture - the ambient one inherits this
    // project's storageState (the admin session cookie), which would
    // defeat the entire point of an "unauthenticated" test.
    const anonymousContext = await request.newContext({
      baseURL: "http://localhost:9000",
    });

    // TEMP DEBUG - remove once the mismatch with curl is understood
    const cookiesInContext = await anonymousContext.storageState();
    console.log("Cookies in this 'fresh' context:", cookiesInContext.cookies);

    const response = await anonymousContext.get("/admin/products");
    console.log("Status:", response.status());
    console.log("Response body:", await response.text());

    expect(response.status()).toBe(401);

    await anonymousContext.dispose();
  });
});