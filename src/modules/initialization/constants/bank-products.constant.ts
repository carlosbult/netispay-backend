import { bank_products_name, currencies } from '@prisma/client';
import { BankProduct } from '../interfaces/bank-product.interface';

interface BankProductsByBank {
  [bankCode: string]: {
    bankName: string;
    products: BankProduct[];
  };
}

export const BANK_PRODUCTS_BY_BANK: BankProductsByBank = {
  BNB: {
    bankName: 'BINANCE',
    products: [
      {
        name: bank_products_name.VERIFICATION_API,
        bank_code: 'BNB',
        api_url: 'https://api.binance.com/api/v1',
        api_key:
          'fUThrnZlUUfzyHbKNMjO4Y9JQl3SqG14oRhD4P2xUmS0Kl4jT6VbvRwzNEtqjdF6',
        api_secret:
          'uhnyJ7ZQoNrQZQQJSkMWGNcOG2Nwi3Saj0pu76iIIkko4fYZAEmKdulODqVtYDBS',
        configurations: {
          create: {
            bank_commission_rate: 0.1,
            currency: currencies.USD,
          },
        },
      },
      {
        name: bank_products_name.PAY_BUTTON,
        bank_code: 'BNB',
        api_url: 'https://api.binance.com/api/v1',
        api_key: 'asdfwerwertwe46543654',
        api_secret: 'asdgq34524563546',
        configurations: {
          create: {
            bank_commission_rate: 0.1,
            currency: currencies.USD,
          },
        },
      },
    ],
  },
  '0134': {
    bankName: 'BANESCO',
    products: [
      {
        name: bank_products_name.PAY_BUTTON,
        bank_code: '0134',
        api_url: 'https://api.banesco.com/paybutton',
        api_key: 'banesco_test_api_key_123',
        api_secret: 'banesco_test_api_secret_456',
        configurations: {
          create: {
            bank_commission_rate: 3.5,
            currency: currencies.VES,
          },
        },
      },
      {
        name: bank_products_name.VERIFICATION_API,
        bank_code: '0134',
        api_url: 'https://api.banesco.com/verification',
        api_key: 'banesco_verification_key',
        api_secret: 'banesco_verification_secret',
        configurations: {
          create: {
            bank_commission_rate: 2.5,
            currency: currencies.VES,
          },
        },
      },
    ],
  },
  '0114': {
    bankName: 'BANCARIBE',
    products: [
      {
        name: bank_products_name.C2P,
        bank_code: '0114',
        api_url: 'https://api.bancaribe.com/paybutton',
        api_key: 'bancaribe',
        api_secret: 'bancaribe_test_api_secret_456',
        configurations: {
          create: {
            bank_commission_rate: 2.2,
            currency: currencies.VES,
          },
        },
      },
      {
        name: bank_products_name.PAY_BUTTON,
        bank_code: '0114',
        api_url: 'https://api.bancaribe.com/paybutton',
        api_key: 'adgqe62456345',
        api_secret: 'rgasdg3456we454',
        configurations: {
          create: {
            bank_commission_rate: 2,
            currency: currencies.VES,
          },
        },
      },
    ],
  },
} as const;

// Mantener la lista plana para compatibilidad con el código existente
export const BANK_PRODUCTS: readonly BankProduct[] = Object.values(
  BANK_PRODUCTS_BY_BANK,
).flatMap((bank) => bank.products);
