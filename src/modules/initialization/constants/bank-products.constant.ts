import {
  bank_products_name,
  currencies,
  payment_category,
} from '@prisma/client';
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
        payment_category: payment_category.CRYPTO,
        configurations: {
          create: {
            bank_commission_rate: 0.1,
            currency: currencies.USD,
            description: 'Verificacion transacciones API Binance',
          },
        },
      },
      {
        name: bank_products_name.PAY_BUTTON,
        bank_code: 'BNB',
        api_url: 'https://api.binance.com/api/v1',
        api_key: 'asdfwerwertwe46543654',
        api_secret: 'asdgq34524563546',
        payment_category: payment_category.CRYPTO,
        configurations: {
          create: {
            bank_commission_rate: 0.1,
            currency: currencies.USD,
            description: 'Pago transacciones boton de pago Binance',
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
        payment_category: payment_category.BANK_TRANSFER,
        configurations: {
          create: {
            bank_commission_rate: 3.5,
            currency: currencies.VES,
            description: 'Boton de pago Banco Banesco',
          },
        },
      },
      {
        name: bank_products_name.VERIFICATION_API,
        bank_code: '0134',
        api_url: 'https://api.banesco.com/verification',
        api_key: 'banesco_verification_key',
        api_secret: 'banesco_verification_secret',
        payment_category: payment_category.BANK_TRANSFER,
        configurations: {
          create: {
            bank_commission_rate: 2.5,
            currency: currencies.VES,
            description: 'Verificacion transacciones API Banesco',
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
        payment_category: payment_category.BANK_TRANSFER,
        configurations: {
          create: {
            bank_commission_rate: 2.2,
            currency: currencies.VES,
            description: 'Boton de pago Banco Caribe',
          },
        },
      },
      {
        name: bank_products_name.PAY_BUTTON,
        bank_code: '0114',
        api_url: 'https://api.bancaribe.com/paybutton',
        api_key: 'adgqe62456345',
        api_secret: 'rgasdg3456we454',
        payment_category: payment_category.BANK_TRANSFER,
        configurations: {
          create: {
            bank_commission_rate: 2,
            currency: currencies.VES,
            description: 'Pago transacciones boton de pago Banco Caribe',
          },
        },
      },
    ],
  },
  '0138': {
    bankName: 'BANCO PLAZA',
    products: [
      {
        name: bank_products_name.C2P,
        bank_code: '0138',
        api_url: 'https://apiqa.bancoplaza.com:8585',
        api_key: 'dc0367760639428799baf555e7d8d039',
        api_secret: '635df2f460f44acd9fcb1c3fd14163b6',
        payment_category: payment_category.BANK_TRANSFER,
        properties: [
          {
            property_key: 'telefonoCobrador',
            property_value: '4160111111',
            title: 'Telefono Cobrador',
            description:
              'Número de teléfono asociado a servicio Pago Móvil Banco Plaza',
          },
          {
            property_key: 'motivo',
            property_value: 'Pago servicio de internet Netispay',
            title: 'Motivo registro de pago',
            description: null,
          },
          {
            property_key: 'origen',
            property_value: '12',
            title: 'Origen de la transacción',
            description:
              'Origen o Canal. Código que busca clasificar el origen de la transacción para el banco',
          },
        ],
        configurations: {
          create: {
            bank_commission_rate: 0,
            currency: currencies.VES,
            description: 'Boton de pago Banco Plaza',
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
