import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BankProductFactory } from '../../interfaces/bank-product-factory.interface';
import { BankProduct } from '../../interfaces/bank-product.interface';
import { BancoPlazaC2PService } from './c2p.service';
import { BancoPlazaAdapter } from '../banco-plaza.adapter';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { Cache } from 'cache-manager';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BancoPlazaFactoryService implements BankProductFactory {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private encryptionService: EncryptionService,
    private prismaService: PrismaService,
    private bancoPlazaAdapter: BancoPlazaAdapter,
  ) {}

  createProduct(type: string): BankProduct {
    try {
      switch (type) {
        case 'C2P':
          return new BancoPlazaC2PService(
            this.prismaService,
            this.encryptionService,
            this.cacheManager,
            this.bancoPlazaAdapter,
          );
        default:
          throw new CustomException({
            message: 'Bank product not registered',
            statusCode: HttpStatus.NOT_FOUND,
            errorCode: ErrorCode.NOT_FOUND,
          });
      }
    } catch (error) {
      console.error('Error creating bank product', error);
      throw new CustomException({
        message: 'Error creating bank product',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
