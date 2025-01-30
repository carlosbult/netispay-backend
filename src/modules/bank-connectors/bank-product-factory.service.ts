import { HttpStatus, Injectable } from '@nestjs/common';
import { BankProduct } from './interfaces/bank-product.interface';
import { BancaribeFactoryService } from './bancaribe/services/bancaribe-factory.service';
import { BanescoFactoryService } from './banesco/services/banesco-factory.service';
import { BinanceFactoryService } from './binance/services/binance-factory.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class BankProductFactoryService {
  constructor(
    private readonly bancaribeFactory: BancaribeFactoryService,
    private readonly banescoFactory: BanescoFactoryService,
    private readonly binanceFactory: BinanceFactoryService,
  ) {}

  createProduct(bankCode: string, productType: string): BankProduct {
    switch (bankCode) {
      case '0114':
        return this.bancaribeFactory.createProduct(productType);
      case '0134':
        return this.banescoFactory.createProduct(productType);
      case 'BNB':
        return this.binanceFactory.createProduct(productType);
      default:
        throw new CustomException({
          message: 'Bank code not registered',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
    }
  }
}
