import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly productPageTitle: Locator;
  readonly sizeOptions: Locator;       // all size buttons (data-testid="option-button")
  readonly addToCartButton: Locator;   // data-testid="add-product-button" - text changes based on state
  readonly optionGroups: Locator;      // all option groups (data-testid="option-group")

  constructor(page: Page) {
    this.page = page;

    this.productPageTitle = page.locator('h2[data-testid="product-title"]');

    this.sizeOptions = page.locator('[data-testid="option-button"]');

    this.addToCartButton = page.locator('[data-testid="add-product-button"]');
    this.optionGroups = page.locator('[data-testid="product-options"]'); // one per variant TYPE (color, size, etc.)
  }

  async goto(productHandle: string) {
    await this.page.goto(`/dk/products/${productHandle}`);
  }

  async verifyProductPageTitle() {
    await expect(this.productPageTitle).toBeVisible();
  }

  async selectProductSize(size: string) {
    const sizeButton = this.sizeOptions.filter({ hasText: size });
    await expect(sizeButton).toBeVisible();
    await sizeButton.click();
  }


  async getAddToCartButtonText(): Promise<string> {
    return (await this.addToCartButton.innerText()).trim();
  }


  async isAddToCartEnabled(): Promise<boolean> {
    return !(await this.addToCartButton.isDisabled());
  }

  async addToCart() {
    await expect(this.addToCartButton).toBeEnabled(); // fail clearly if we try clicking while disabled
    const cartCountLocator = this.page.getByText(/Cart \(\d+\)/);
    const beforeText = await cartCountLocator.innerText();
    await this.addToCartButton.click();
    await this.page.waitForTimeout(1000);
    await expect(cartCountLocator).not.toHaveText(beforeText);
    
    //give timeout
    
  }

  async selectRandomOptionInEveryGroup(): Promise<Record<number, string>> {
  const groupCount = await this.optionGroups.count();
  const selections: Record<number, string> = {}; // e.g. { 0: "White", 1: "S" }

  for (let i = 0; i < groupCount; i++) {
    const optionsInThisGroup = this.optionGroups.nth(i).locator('[data-testid="option-button"]');
    const optionCount = await optionsInThisGroup.count();

    const randomIndex = Math.floor(Math.random() * optionCount);
    const chosenOption = optionsInThisGroup.nth(randomIndex);

    const chosenText = (await chosenOption.innerText()).trim();
    await chosenOption.click();

    selections[i] = chosenText; // remember what we picked, in case the test wants to verify later
  }

  return selections;
}
}