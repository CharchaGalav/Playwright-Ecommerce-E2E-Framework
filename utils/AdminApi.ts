import { APIRequestContext } from '@playwright/test';

export class AdminApi {
  constructor(private request: APIRequestContext, private baseUrl: string = 'http://localhost:9000') {}

  async getDefaultSalesChannelId(): Promise<string> {
    const response = await this.request.get(`${this.baseUrl}/admin/sales-channels`);
    const body = await response.json();
    return body.sales_channels[0]?.id;
  }

  // Create product directly via Medusa Admin API
  async createProduct(productData: { title: string; handle: string; priceEur: number }) {
    const response = await this.request.post(`${this.baseUrl}/admin/products`, {
      data: {
        title: productData.title,
        handle: productData.handle,
        status: 'published',
        options: [{ title: 'Size', values: ['S', 'M'] }],
        variants: [
          {
            title: 'S',
            options: { Size: 'S' },
            prices: [{ currency_code: 'eur', amount: productData.priceEur * 100 }],
          },
        ],
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create product via API: ${await response.text()}`);
    }

    const body = await response.json();
    return body.product; // Returns created product object (including ID)
  }

  // Delete product directly via Medusa Admin API (Teardown)
  async deleteProduct(productId: string) {
    await this.request.delete(`${this.baseUrl}/admin/products/${productId}`);
  }
}