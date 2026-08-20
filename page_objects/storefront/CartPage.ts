import { Page, Locator, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly cartRows: Locator;
  readonly unitPrices: Locator;
  readonly lineItemPrices: Locator;
  readonly cartbutton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator('[data-testid="product-row"]');
    this.unitPrices = page.locator('[data-testid="product-unit-price"]');
    this.lineItemPrices = page.locator('[data-testid="product-price"]');
    this.cartbutton = page.locator('[data-testid="nav-cart-link"]');
  }

  async gotoCart() {
    
    await this.cartbutton.click();
    const rowCount = await this.getRowCount();
    console.log('Actual cart row count:', rowCount);
    
  }

  async getRowCount(): Promise<number> {
    await this.cartRows.first().waitFor({ state: "visible" });
    return this.cartRows.count();
  }

  getQuantitySelector(rowIndex: number): Locator {
    return this.cartRows
      .nth(rowIndex)
      .locator('[data-testid="product-select-button"]');
  }

  async setQuantity(rowIndex: number, quantity: number) {
    const selector = this.getQuantitySelector(rowIndex);
    await selector.selectOption(String(quantity));
  }

  getDeleteButton(rowIndex: number): Locator {
    return this.cartRows.nth(rowIndex).locator("button:has(svg)");
  }

  async deleteItem(rowIndex: number) {
    await this.getDeleteButton(rowIndex).click();
  }

  async getUnitPrice(rowIndex: number): Promise<string> {
    return (await this.unitPrices.nth(rowIndex).innerText()).trim();
  }

  async getLineItemPrice(rowIndex: number): Promise<string> {
    return (await this.lineItemPrices.nth(rowIndex).innerText()).trim();
  }

  async calculateExpectedSubtotal(): Promise<number> {
  const priceTexts = await this.lineItemPrices.allInnerTexts(); 
  console.log('All matched price elements:', priceTexts);
  //Instead of writing a for loop to grab text row by row, Playwright’s .allInnerTexts() fetches the text content from every element matching this.lineItemPrices at the exact same time.["€10.00 ", " €15.50", "€5.00"]
  const prices = priceTexts.map(text => parseFloat(text.replace('€', '').trim()));
  //parseFloat(...) Converts the string into a mathematical number ("10.00" becomes 10.00).Resulting Data: An array of pure numbers ready for math.Example Output: [10.00, 15.50, 5.00]
  return prices.reduce((sum, price) => sum + price, 0); 
  //reduce() method iterates over the array to collapse all items into a single final value.
    //(sum, price) => sum + price: The accumulator formula. sum holds the running total, and price is the current item being added.
  //, 0: The initial starting value for sum.
}

}
