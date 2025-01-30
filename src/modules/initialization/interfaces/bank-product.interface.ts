import { bank_products_name, currencies } from '@prisma/client';

export interface BankProductConfiguration {
  readonly bank_commission_rate: number;
  readonly currency: currencies;
}

export interface BankProduct {
  readonly name: bank_products_name;
  readonly bank_code: string;
  readonly api_url: string;
  readonly api_key: string;
  readonly api_secret: string;
  readonly configurations: {
    readonly create: BankProductConfiguration;
  };
} 