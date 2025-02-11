import { HttpStatus, Injectable } from '@nestjs/common';
import { BankProduct } from './interfaces/bank-product.interface';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

import { BancaribeFactoryService } from './bancaribe/services/bancaribe-factory.service';
import { BanescoFactoryService } from './banesco/services/banesco-factory.service';
import { BinanceFactoryService } from './binance/services/binance-factory.service';
import { BancoPlazaFactoryService } from './banco-plaza/services/banco-plaza-factory.service';

@Injectable()
export class BankProductFactoryService {
  constructor(
    private readonly bancaribeFactory: BancaribeFactoryService,
    private readonly banescoFactory: BanescoFactoryService,
    private readonly binanceFactory: BinanceFactoryService,
    private readonly bancoPlazaFactory: BancoPlazaFactoryService,
  ) {}

  createProduct(bankCode: string, productType: string): BankProduct {
    try {
      switch (bankCode) {
        case '0114':
          return this.bancaribeFactory.createProduct(productType);
        case '0134':
          return this.banescoFactory.createProduct(productType);
        case 'BNB':
          return this.binanceFactory.createProduct(productType);
        case '0138':
          return this.bancoPlazaFactory.createProduct(productType);
        default:
          throw new CustomException({
            message: 'Bank code not registered',
            statusCode: HttpStatus.NOT_FOUND,
            errorCode: ErrorCode.NOT_FOUND,
          });
      }
    } catch (error) {
      console.error('Error creating bank product', error);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error creating bank product',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
