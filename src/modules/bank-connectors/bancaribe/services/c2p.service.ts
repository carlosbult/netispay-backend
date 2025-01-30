import { BankProduct } from '../../interfaces/bank-product.interface';
import { BancaribeC2PDto } from '../dto/c2p.dto';

export class BancaribeC2PService implements BankProduct {
  processPayment(data: BancaribeC2PDto): Promise<any> {
    // Implementación del procesamiento de pago C2P Bancaribe
    return;
  }
}
