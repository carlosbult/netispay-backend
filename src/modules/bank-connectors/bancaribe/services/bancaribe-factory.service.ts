import { BankProductFactory } from '../../interfaces/bank-product-factory.interface';
import { BankProduct } from '../../interfaces/bank-product.interface';
import { BancaribeC2PService } from './c2p.service';
import { BancaribeB2PService } from './b2p.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from 'src/interfaces/errorCodes';

export class BancaribeFactoryService implements BankProductFactory {
  createProduct(type: string): BankProduct {
    switch (type) {
      case 'C2P':
        return new BancaribeC2PService();
      case 'B2P':
        return new BancaribeB2PService();
      default:
        throw new CustomException({
          message: 'Bank product not registered',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
    }
  }
}
