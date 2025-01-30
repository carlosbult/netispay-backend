import { BankProduct } from '../../interfaces/bank-product.interface';
import { BanescoC2PDto } from '../dto/c2p.dto';

export class BanescoC2PService implements BankProduct {
  processPayment(data: BanescoC2PDto): Promise<any> {
    // Implementación del procesamiento de pago C2P Bancaribe
    return;
  }
}
