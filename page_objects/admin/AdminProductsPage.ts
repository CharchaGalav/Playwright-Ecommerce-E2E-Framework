import { Page, Locator, expect } from '@playwright/test';

export class AdminProductsPage {
  readonly page: Page;

  // ---- Products list page ----
  readonly createButton: Locator;
  readonly productRows: Locator;

  // ---- Step 1: Details ----
  readonly titleInput: Locator;
  readonly subtitleInput: Locator;
  readonly descriptionInput: Locator;
  readonly continueButton: Locator;

  // ---- Step 3: Variants ----
  readonly variantsToggle: Locator;
  readonly optionsCombobox: Locator;
  readonly optionsListbox: Locator;
  readonly optionValuesInput: Locator;

  // ---- Final actions ----
  readonly publishButton: Locator;
  readonly saveDraftButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // --- Products list ---
    this.createButton = page.locator('a[href="/app/products/create"]');
    // No data-testid available on rows in this admin table - scoping to
    // table body and matching by visible text content instead.
    this.productRows = page.locator('table tbody tr');


    this.titleInput = page.locator('input[name="title"]').last();
    this.subtitleInput = page.getByLabel('Subtitle').last();
    this.descriptionInput = page.getByLabel('Description').last();

    // Same "Continue" button text used on Details and Organize steps
    this.continueButton = page.locator('button:has-text("Continue")').last();

    // --- Variants step ---
    this.variantsToggle = page.locator('button[role="switch"]').first();
    this.optionsCombobox = page.locator('[role="combobox"]');
    this.optionsListbox = page.locator('[role="listbox"]');
    this.optionValuesInput = page.getByPlaceholder('Red, Blue, Green');

    // --- Final actions ---
    this.publishButton = page.locator('[data-name="publish-button"]');
    this.saveDraftButton = page.locator('[data-name="save-draft-button"]');
  }

  async goto() {
    await this.page.goto('/app/products');
  } 

  async clickCreate() {
    await this.createButton.click();
  }

  /**
   * Fills the Details step. Title is required; subtitle/description
   * are optional per the UI.
   */
  async fillGeneralDetails(details: { title: string; subtitle?: string; description?: string }) {
    await this.titleInput.fill(details.title);
    if (details.subtitle) await this.subtitleInput.fill(details.subtitle);
    if (details.description) await this.descriptionInput.fill(details.description);
  }

  /**
   * Ensures the "product with variants" toggle is ON before adding
   * options. Checks current state first rather than assuming.
   */
  async ensureVariantsEnabled() {
    const isChecked = await this.variantsToggle.getAttribute('aria-checked');
    if (isChecked !== 'true') {
      await this.page.getByText('Yes, this is a product with variants').last().click();
      //how many role switch are there ?
      console.log(`Number of role switch elements: ${await this.page.locator('button[role="switch"]').count()}`);
    }
  }

  /**
   * Selects one product option type (e.g. "Size" or "Color") on the
   * Details step. Values (S/M/L/XL, Black/White, etc.) POPULATE
   * AUTOMATICALLY once the type is selected - no manual value entry
   * needed. This lives on the Details tab, alongside the variants
   * toggle - NOT on a separate step.
   */
 async selectProductOption(optionName: string) {
  await this.optionsCombobox.click();
  const option = this.optionsListbox.locator(`text="${optionName}"`); 

  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();
}

// Helper to wait until a specific wizard tab is active
async waitForTab(tabName: 'Details' | 'Organize' | 'Variants') {
  const tabButton = this.page.locator(`button[role="tab"]:has-text("${tabName}")`).last();
  await expect(tabButton).toHaveAttribute('data-state', 'active');
}

  /**
   * Sets Managed Inventory + EUR price for ONE variant row by index.
   * The visible checkbox is a role="checkbox" BUTTON (custom-styled),
   * not a native <input> - so we .click() it, not .check().
   */
  async configureVariant(index: number, priceEur: string) {
    const manageInventoryCheckbox = this.page.locator(
      `[role="checkbox"][data-field="variants.${index}.manage_inventory"]`
    );
    await manageInventoryCheckbox.click();

    const priceInput = this.page.locator(`[name="variants.${index}.prices.eur"]`);
    await priceInput.fill(priceEur);
  }

  /**
   * Configures ALL generated variant rows with the same price. Row
   * count is discovered dynamically (not hardcoded) so this adapts
   * to however many variant combinations the chosen options produced.
   */
  async configureAllVariants(priceEur: string) {
    const variantRows = this.page.locator('[role="gridcell"][data-column-index="3"]');
    await expect(variantRows.first()).toBeVisible();
    const rowCount = await variantRows.count();

    for (let i = 0; i < rowCount; i++) {
      await this.configureVariant(i, priceEur);
    }
  }

  async publishProduct() {
    await expect(this.publishButton).toBeEnabled();
    await this.publishButton.click();
  }

  async saveDraft() {
    await this.saveDraftButton.click();
  }

  /**
   * Verifies a product with the given name appears in the products list.
   */
  async verifyProductExistsInList(name: string) {
    await this.goto();
    await this.productRows.first().waitFor({ state: 'visible' });
    const searchInput = this.page.getByPlaceholder(/search/i);

  // 2. Type the unique title to filter the table
    await searchInput.fill(name);
    const row = this.productRows.filter({ hasText: name });
    await expect(row).toBeVisible();
  }
}