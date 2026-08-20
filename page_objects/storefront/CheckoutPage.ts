import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // ---- Shipping Address step (confirmed) ----
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly emailInput: Locator;
  readonly continueToDeliveryButton: Locator;
  readonly checkoutButton: Locator; 

  // ---- Delivery + Payment options (confirmed) ----
  // Both delivery and payment options use the SAME pattern: an element
  // with role="radio" that contains its own label text as a descendant
  // (e.g. "Standard Shipping", "Manual Payment"). This means ONE
  // locator + one selection method works for both steps.
  readonly radioOptions: Locator;

  readonly continueToPaymentButton: Locator; 
  readonly continueToReviewButton: Locator;  
  readonly placeOrderButton: Locator;       
  
  readonly orderConfirmationHeading: Locator;

  readonly cartSubtotal: Locator;
  readonly cartTotal: Locator;

  readonly orderConfirmationContainer: Locator; 
    readonly orderId: Locator; 

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-testid="shipping-first-name-input"]');
    this.lastNameInput = page.locator('[data-testid="shipping-last-name-input"]');
    this.addressInput = page.locator('[data-testid="shipping-address-input"]');
    this.postalCodeInput = page.locator('[data-testid="shipping-postal-code-input"]');
    this.cityInput = page.locator('[data-testid="shipping-city-input"]');
    this.countrySelect = page.locator('[data-testid="shipping-country-select"]');
    this.emailInput = page.locator('[data-testid="shipping-email-input"]');
    this.continueToDeliveryButton = page.getByRole('button', { name: 'Continue to delivery' });

    // getByRole('radio') finds BOTH delivery and payment options, since
    // they share the same role. On any given step, only that step's
    // options are actually present in the DOM, so this stays accurate
    // without needing two separate locators.
    this.radioOptions = page.getByRole('radio');

    this.continueToPaymentButton = page.locator('[data-testid="submit-delivery-option-button"]');
    this.continueToReviewButton = page.locator('[data-testid="submit-payment-button"]');
    this.placeOrderButton = page.locator('[data-testid="submit-order-button"]');

  
    this.orderConfirmationContainer = page.locator('[data-testid="order-complete-container"]');
    this.orderConfirmationHeading = page.getByText('Thank you!');
    this.orderId = page.locator('[data-testid="order-id"]');
    this.cartSubtotal = page.locator('[data-testid="cart-subtotal"]');
    this.cartTotal = page.locator('[data-testid="cart-total"]');
    this.checkoutButton = page.getByRole('button', { name: 'Go to checkout' });
  }

  async goto() {
    await this.checkoutButton.click();
  }

  async fillShippingAddress(details: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    email: string;
  }) {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.addressInput.fill(details.address);
    await this.postalCodeInput.fill(details.postalCode);
    await this.cityInput.fill(details.city);
    await this.countrySelect.selectOption(details.country);
    await this.emailInput.fill(details.email);
  }

  async continueToDelivery() {
    await this.continueToDeliveryButton.click();
  }

  /**
   * Selects any radio-style option (delivery method OR payment method)
   * by its visible label text. Works for both steps because they share
   * the same role="radio" + descendant-text pattern.
   */
  async selectOptionByLabel(labelText: string) {
    const option = this.radioOptions.filter({ hasText: labelText });
    await expect(option).toBeVisible();
    await option.click();
  }

  /**
   * The submit buttons are disabled (literal `disabled` attribute) until
   * an option is selected - this is a real business rule. We assert
   * toBeEnabled() BEFORE clicking, so if this rule is ever broken (e.g.
   * button becomes clickable with nothing selected), the test fails
   * clearly here instead of silently proceeding.
   */
  async continueToPayment() {
    await expect(this.continueToPaymentButton).toBeEnabled();
    await this.continueToPaymentButton.click();
  }

  async continueToReview() {
    await expect(this.continueToReviewButton).toBeEnabled();
    await this.continueToReviewButton.click();
  }

  async placeOrder() {
    await expect(this.placeOrderButton).toBeEnabled();
    await this.placeOrderButton.click();
  }
  

  async getCartTotalValue(): Promise<string> {
    return (await this.cartTotal.getAttribute('data-value')) ?? '';
  }

  async getCartSubtotalValue(): Promise<string> {
  return (await this.cartSubtotal.getAttribute('data-value')) ?? '';
}

  async verifyOrderConfirmed() {
  await expect(this.orderConfirmationContainer).toBeVisible();
  await expect(this.orderConfirmationHeading).toBeVisible();
}
}


