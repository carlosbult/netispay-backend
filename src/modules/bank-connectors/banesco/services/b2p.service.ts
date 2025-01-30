import { BankProduct } from '../../interfaces/bank-product.interface';
import { BanescoB2PDto } from '../dto/b2p.dto';

export class BanescoB2PService implements BankProduct {
  transferFunds(data: BanescoB2PDto): Promise<any> {
    return;
  }
}
