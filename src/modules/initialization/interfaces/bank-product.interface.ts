import {
  bank_products_name,
  currencies,
  payment_category,
} from '@prisma/client';

export interface BankProductConfiguration {
  readonly bank_commission_rate: number;
  readonly currency: currencies;
  readonly description: string;
}

export interface BankProduct {
  readonly name: bank_products_name;
  readonly bank_code: string;
  readonly api_url: string;
  readonly api_key: string;
  readonly api_secret: string;
  readonly payment_category: payment_category;
  readonly configurations: {
    readonly create: BankProductConfiguration;
  };
  readonly properties?: {
    readonly property_key: string;
    readonly property_value: string;
    readonly title: string;
    readonly description?: string;
  }[];
}
