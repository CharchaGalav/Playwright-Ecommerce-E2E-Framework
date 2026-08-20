import {Page, Locator, expect} from '@playwright/test';

export class StorePage {
    readonly page: Page
    readonly productlist: Locator;
    readonly productCards: Locator;
    readonly productTitles: Locator;
    readonly productPrices: Locator;

    constructor(page: Page){
        this.page = page;
        this.productlist = page.getByTestId('products-list');
        this.productCards = this.productlist.locator('li');
        this.productTitles = page.getByTestId('product-title');
        this.productPrices = page.getByTestId('price');
    }

    async goTo(){
        await this.page.goto('http://localhost:8000/dk/store');
    }

    async productCount() : Promise<number> {
        return await this.productCards.count();
    }

    async selectProductByName(productName: string){
        const card = this.productCards.filter({hasText: productName});
        await expect(card).toHaveCount(1);
        await card.click();
    }

    async selectRandomProduct() :Promise<{name: string, price: string}> {
        await expect(this.productCards.first().waitFor({state: 'visible'}));
        const count = await this.productCount();
        expect(count).toBeGreaterThan(0);
        const randomIndex = Math.floor(Math.random() *  count);
        const selectedCard = this.productCards.nth(randomIndex);

        const name = (await this.productTitles.nth(randomIndex).innerText()).trim();
        const price = (await this.productPrices.nth(randomIndex).innerText()).trim();

        await selectedCard.locator('a').click();

        return {name, price};
    }

}