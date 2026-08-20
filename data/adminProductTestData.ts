export interface NewProductData {
  title: string;
  subtitle?: string;
  description?: string;
  optionType: 'Size' | 'Color'; // values auto-populate once selected - no need to list them
  variantPriceEur: string;
}

export const newProductsToCreate: NewProductData[] = [
  {
    title: 'QA Test Hoodie',
    subtitle: 'Created by automated test',
    description: 'A cozy test hoodie for automation verification.',
    optionType: 'Size',
    variantPriceEur: '25.00',
  },
  {
    title: 'QA Test Cap',
    subtitle: 'Created by automated test',
    description: 'A test cap for automation verification.',
    optionType: 'Color',
    variantPriceEur: '15.00',
  },
];