import { test, expect } from "@playwright/test";

test.describe("Store API - public product catalog", () => {
  test("GET /store/products returns published products with expected shape", async ({
    request,
  }) => {
    const response = await request.get("/store/products", {
      params: { limit: 5 },
      headers: {
        // Medusa's Store API requires a publishable API key on every
        // request. Set MEDUSA_STORE_PUBLISHABLE_KEY in your env / .env
        // file (find it under Settings > API Key Management in admin).
        "x-publishable-api-key": process.env.MEDUSA_STORE_PUBLISHABLE_KEY ?? "",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);

    // Spot-check the shape of the first product rather than asserting
    // the full payload - enough to catch a broken/renamed field without
    // the test becoming a brittle full-schema snapshot.
    const product = body.products[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("title");
    expect(product).toHaveProperty("handle");
    expect(Array.isArray(product.variants)).toBeTruthy();
  });
});