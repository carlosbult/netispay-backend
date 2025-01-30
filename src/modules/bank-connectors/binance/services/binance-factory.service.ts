import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BankProductFactory } from '../../interfaces/bank-product-factory.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BankProduct } from '../../interfaces/bank-product.interface';
import { BinanceTransactionService } from './transaction.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class BinanceFactoryService implements BankProductFactory {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private encryptionService: EncryptionService,
    private prismaService: PrismaService,
  ) {}

  createProduct(type: string): BankProduct {
    switch (type) {
      case 'VERIFICATION_API':
        return new BinanceTransactionService(
          this.prismaService,
          this.encryptionService,
          this.cacheManager,
        );
      default:
        throw new CustomException({
          message: 'Producto Binance no registrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
    }
  }
}
