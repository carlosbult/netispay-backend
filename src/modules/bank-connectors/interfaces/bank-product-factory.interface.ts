import { BankProduct } from './bank-product.interface';

export interface BankProductFactory {
  createProduct(type: string): BankProduct;
}
