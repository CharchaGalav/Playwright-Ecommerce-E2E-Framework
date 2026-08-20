import { test as base } from '@playwright/test';
import { HomePage } from '../page_objects/storefront/HomePage';
import { StorePage } from '../page_objects/storefront/StorePage';
import { ProductPage } from '../page_objects/storefront/ProductPage';
import { CartPage } from '../page_objects/storefront/CartPage';
import { CheckoutPage } from '../page_objects/storefront/CheckoutPage';
import { AdminProductsPage } from '../page_objects/admin/AdminProductsPage';

type Pages = {
  homePage: HomePage;
  storePage: StorePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  adminProductsPage: AdminProductsPage

};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  storePage: async ({ page }, use) => {
    await use(new StorePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  adminProductsPage: async ({ page }, use) => {
    await use(new AdminProductsPage(page));
  }
  


});

export { expect } from '@playwright/test';