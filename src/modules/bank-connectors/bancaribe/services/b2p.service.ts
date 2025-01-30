import { BankProduct } from '../../interfaces/bank-product.interface';
import { BancaribeB2PDto } from '../dto/b2p.dto';

export class BancaribeB2PService implements BankProduct {
  transferFunds(data: any): Promise<any> {
    return;
  }
}
