// tests/cross-app/admin-to-storefront.spec.ts
import { test, expect } from "../../fixtures/PageFixtures";
import { StorePage } from "../../page_objects/storefront/StorePage";
import { ProductPage } from "../../page_objects/storefront/ProductPage";

test("7.1 - product created and published in admin appears on storefront", async ({
  adminProductsPage,
  page, // admin's page - already logged in via storageState
}) => {
  const uniqueTitle = `Cross App Test Product ${Date.now()}`;

  await test.step("Create and publish product via admin", async () => {
    await adminProductsPage.goto();
    await adminProductsPage.clickCreate();
    await adminProductsPage.fillGeneralDetails({
      title: uniqueTitle,
      description: "Created for cross-app verification.",
    });
    await adminProductsPage.ensureVariantsEnabled();
    await adminProductsPage.selectProductOption("Size");
    await adminProductsPage.continueButton.click();
    await adminProductsPage.waitForTab("Organize");
    await adminProductsPage.continueButton.click();
    await adminProductsPage.waitForTab("Variants");
    await adminProductsPage.configureAllVariants("19.99");
    await adminProductsPage.publishProduct();
    await adminProductsPage.verifyProductExistsInList(uniqueTitle);
  });

  // --- Verify it on the storefront, in a SEPARATE browser context ---
  // A fresh, unauthenticated context is a genuinely separate "customer"
  // session, not just the same authenticated admin page in a new tab -
  // that's what makes this a real cross-app test.
  const storefrontContext = await page.context().browser()!.newContext({
    baseURL: "http://localhost:8000/dk",
  });

  // page.keyboard.press('Control+Shift+R') does NOT do a hard refresh -
  // Playwright dispatches that as a synthetic key event into the page's
  // content, but "hard refresh" is a browser-chrome-level shortcut that
  // real browsers intercept before it ever reaches the page. It was a
  // silent no-op. What a hard refresh actually does is send
  // Cache-Control/Pragma: no-cache on the request - so send those
  // headers directly instead.
  await storefrontContext.setExtraHTTPHeaders({
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  });

  const storefrontPage = await storefrontContext.newPage();
  const storePage = new StorePage(storefrontPage);
  const productPage = new ProductPage(storefrontPage);

  await test.step("Verify product appears in storefront listing (retry for Next.js ISR cache)", async () => {
    // Even with caching bypassed, ISR revalidation can lag by a couple
    // seconds after publish - retry the navigation itself, not just the
    // assertion, until the new data is actually served.
    await expect(async () => {
      await storePage.goTo();
      await expect(
        storePage.productTitles.filter({ hasText: uniqueTitle })
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 60000, intervals: [2000] });
  });

  await test.step("Verify product detail page resolves correctly", async () => {
    await storePage.selectProductByName(uniqueTitle);
    await productPage.verifyProductPageTitle();
    await expect(productPage.productPageTitle).toHaveText(uniqueTitle);
  });

  await storefrontContext.close(); // clean up the extra context
});