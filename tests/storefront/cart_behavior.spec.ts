import { test, expect } from '../../fixtures/PageFixtures';

test.describe('Cart behavior', () => {
  test.beforeEach(async ({ homePage, storePage, productPage }) => {
    await homePage.goto();
    await homePage.goToStore();
    await expect(storePage.productCards.first()).toBeVisible();
    await storePage.selectProductByName('Medusa Sweatpants');
    await productPage.selectProductSize('M');
    await productPage.addToCart();
  });

  test('changing quantity updates the line item price correctly', async ({ page, cartPage }) => {
    await cartPage.gotoCart();
    await expect(cartPage.cartRows.first()).toBeVisible();

    const unitPriceText = await cartPage.getUnitPrice(0); // e.g. "€10.00"
    const unitPrice = parseFloat(unitPriceText.replace('€', ''));

    await cartPage.setQuantity(0, 3);

    const newLineTotal = await cartPage.getLineItemPrice(0);
    const expectedTotal = (unitPrice * 3).toFixed(2);

    expect(newLineTotal).toContain(expectedTotal);
  });

  test('removing an item empties the cart', async ({ page, cartPage }) => {
    await cartPage.gotoCart();
    await expect(cartPage.cartRows.first()).toBeVisible();

    await cartPage.deleteItem(0);
    await page.waitForTimeout(2000);
    // After deletion, the row should disappear entirely.
    await expect(cartPage.cartRows).toHaveCount(0);
  });
});

