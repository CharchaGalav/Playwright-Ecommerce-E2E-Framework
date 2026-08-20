import { test, expect } from '../../fixtures/PageFixtures';
import { newProductsToCreate } from '../../data/adminProductTestData';

test.describe('Admin product creation', () => {
  for (const productData of newProductsToCreate) {
    test(`5.1 - admin can create and publish product: ${productData.title}`, async ({ adminProductsPage }) => {
      const uniqueTitle = `${productData.title} ${Date.now()}`;

      await adminProductsPage.goto();
      await adminProductsPage.clickCreate();

      await test.step('Fill Details, enable variants, select option type', async () => {
        await adminProductsPage.fillGeneralDetails({ ...productData, title: uniqueTitle });
        // Toggle + option selection live on the Details step itself,
        // not a separate tab - must happen BEFORE clicking Continue.
        await adminProductsPage.ensureVariantsEnabled();
        await adminProductsPage.selectProductOption(productData.optionType);
        await adminProductsPage.continueButton.click(); // Details -> Organize
        await adminProductsPage.waitForTab('Organize');
      });

      await test.step('Skip Organize step (all fields optional)', async () => {
        await adminProductsPage.continueButton.click(); // Organize -> Variants
        await adminProductsPage.waitForTab('Variants');
      });

      await test.step('Configure variant prices and managed inventory', async () => {
        // Values (S/M/L/XL etc.) already auto-generated the variant
        // rows on the previous step - this tab is ONLY pricing + inventory.
        await adminProductsPage.configureAllVariants(productData.variantPriceEur);
      });

      await test.step('Publish the product', async () => {
        await adminProductsPage.publishProduct();
      });

      await test.step('Verify product appears in product list', async () => {
        await adminProductsPage.verifyProductExistsInList(uniqueTitle);
      });
    });
  }
});