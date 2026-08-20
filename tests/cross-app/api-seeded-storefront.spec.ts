import { test, expect } from '../../fixtures/PageFixtures';
import { AdminApi } from '../../utils/AdminApi';

test('Fast setup: Seed product via API and view on storefront UI', async ({ page, request }) => {
  const adminApi = new AdminApi(request);
  const handle = `fast-shirt-${Date.now()}`;
  const title = `Fast Shirt ${Date.now()}`;

  // 1. Seed in 300ms via API
  const product = await adminApi.createProduct({ title, handle, priceEur: 29.99 });

  // 2. Verify on Storefront UI immediately
  await page.goto(`http://localhost:8000/dk/products/${handle}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // 3. Teardown via API
  await adminApi.deleteProduct(product.id);
});