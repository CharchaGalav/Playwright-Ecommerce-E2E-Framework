import {Page, Locator} from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly storeLink: Locator;
    readonly MenuButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.MenuButton = page.getByRole('button', {name: 'Menu', exact: true});
        this.storeLink = page.getByRole('link', {name: 'Store', exact: true});
        
    }

    async goto() {
        await this.page.goto('http://localhost:8000/dk');

    }

    async goToStore() {
        await this.MenuButton.first().click();
        await this.storeLink.first().click();
    }
}