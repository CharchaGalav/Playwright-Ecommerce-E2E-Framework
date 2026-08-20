import { test, expect } from '../../fixtures/PageFixtures';

test.describe('Product stock behavior by variant', () => {
  test('1.7 - Add to cart is disabled until a size is selected', async ({ homePage, storePage, productPage }) => {
    await homePage.goto();
    await homePage.goToStore();
    const { name: chosenName } = await storePage.selectRandomProduct();

    await test.step('Verify product page loaded correctly', async () => {
      await productPage.verifyProductPageTitle();
      await expect(productPage.productPageTitle).toContainText(chosenName);
    });

    await test.step('Before selecting a size, Add to Cart should be disabled', async () => {
      // Real business rule: you cannot buy a variant-based product
      // without picking a variant first (size in this case).
      expect(await productPage.isAddToCartEnabled()).toBeFalsy();
      expect(await productPage.getAddToCartButtonText()).toMatch(/out of stock/i);
    });

    await test.step('After selecting a size, Add to Cart should become enabled', async () => {
      await productPage.selectProductSize('M');
      expect(await productPage.isAddToCartEnabled()).toBeTruthy();
      expect(await productPage.getAddToCartButtonText()).toMatch(/add to cart/i);
    });

    await test.step('Clicking Add to Cart succeeds', async () => {
      await productPage.addToCart();
    });
  });
});