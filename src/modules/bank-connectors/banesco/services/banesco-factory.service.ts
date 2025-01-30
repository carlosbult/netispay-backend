import { Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BankProductFactory } from '../../interfaces/bank-product-factory.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BankProduct } from '../../interfaces/bank-product.interface';
import { BanescoPayButtonService } from './payButton.service';
import { BanescoB2PService } from './b2p.service';
import { BanescoC2PService } from './c2p.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

export class BanescoFactoryService implements BankProductFactory {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private encryptionService: EncryptionService,
    private prismaService: PrismaService,
  ) {}

  createProduct(type: string): BankProduct {
    switch (type) {
      case 'PAY_BUTTON':
        return new BanescoPayButtonService(
          this.prismaService,
          this.encryptionService,
          this.cacheManager,
        );
      case 'B2P':
        return new BanescoB2PService();
      case 'C2P':
        return new BanescoC2PService();
      default:
        throw new CustomException({
          message: 'Bank product not registered',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
    }
  }
}
