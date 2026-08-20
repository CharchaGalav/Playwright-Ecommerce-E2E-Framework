// tests/storefront/04_checkout.spec.ts
import { test, expect } from '../../fixtures/PageFixtures';
import { validGuestAddress } from '../../data/checkoutTestData';

test.describe('Guest checkout flow', () => {
  test.beforeEach(async ({ homePage, storePage, productPage }) => {
    await homePage.goto();
    await homePage.goToStore();
    await expect(storePage.productCards.first()).toBeVisible();
    await storePage.selectProductByName('Medusa Sweatpants');
    await productPage.selectProductSize('M');
    await productPage.addToCart();
  });

  test('3.1 & 3.9 & 3.11 - complete guest checkout, verify total, verify confirmation', async ({
    page, cartPage, checkoutPage,
  }) => {
    test.setTimeout(60000);
    await cartPage.gotoCart();
    await expect(cartPage.cartRows.first()).toBeVisible();

    await checkoutPage.goto();
    const totalBeforeCheckout = await checkoutPage.getCartTotalValue();

    await test.step('Fill shipping address', async () => {
      await checkoutPage.fillShippingAddress(validGuestAddress);
      await checkoutPage.continueToDelivery();
    });

    await test.step('Select Standard Shipping and continue', async () => {
      await checkoutPage.selectOptionByLabel('Standard Shipping');
      await checkoutPage.continueToPayment();
    });

    await test.step('Select Manual Payment and continue', async () => {
      await checkoutPage.selectOptionByLabel('Manual Payment');
      await checkoutPage.continueToReview();
    });

    await test.step('Place the order', async () => {
      await checkoutPage.placeOrder();
    });

    await test.step('Verify order confirmed (3.11) and total matches (3.9)', async () => {
      await checkoutPage.verifyOrderConfirmed();
      const totalOnConfirmation = await checkoutPage.getCartTotalValue();
      expect(totalOnConfirmation).toBe(totalBeforeCheckout);
    });
  });

  test('3.3 - submitting checkout with empty fields does not proceed', async ({
    page,
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.gotoCart();
    await expect(cartPage.cartRows.first()).toBeVisible();
    await checkoutPage.goto();
    await checkoutPage.continueToDelivery();
    await expect(page).toHaveURL(/step=address/);
  });
});