import {test, expect } from '../../fixtures/PageFixtures';

test.describe('Cart totals with multiple different products', () => {
  test('cart subtotal correctly sums multiple different products', async ({
    homePage,
    storePage,
    productPage,
    cartPage,
    checkoutPage, 
    page,
  }) => {
    test.setTimeout(120000);
    await homePage.goto();
    await homePage.goToStore();
    await expect(storePage.productCards.first()).toBeVisible();

    const addedProducts: string[] = [];

    for (let i = 0; i < 3; i++) {
      await storePage.goTo();
      await expect(storePage.productCards.first()).toBeVisible();
      const { name } = await storePage.selectRandomProduct();

      const selections = await productPage.selectRandomOptionInEveryGroup();
      console.log(`Product: ${name}, selected variants:`, selections);
  // e.g. logs: { 0: 'Black', 1: 'S' }  OR  { 0: 'M' }  depending on the product
    //   await productPage.selectProductSize('M');
      await productPage.addToCart();
      addedProducts.push(name);
    }

    await cartPage.gotoCart();
    await expect(cartPage.cartRows).toHaveCount(3); // sanity check: all 3 actually made it into the cart
    await page.pause();

    const expectedSubtotal = await cartPage.calculateExpectedSubtotal();

    await checkoutPage.goto();
    await page.reload();
    const actualSubtotalRaw = await checkoutPage.getCartSubtotalValue();
    const actualSubtotal = parseFloat(actualSubtotalRaw);

    console.log(`Added products: ${addedProducts.join(', ')}`);
    console.log('Expected subtotal:', expectedSubtotal);
    console.log('Actual subtotal (raw):', actualSubtotalRaw);
    expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);
  });
});