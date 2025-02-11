import { Module } from '@nestjs/common';

import { BancaribeFactoryService } from './bancaribe/services/bancaribe-factory.service';
import { BanescoFactoryService } from './banesco/services/banesco-factory.service';
import { BinanceFactoryService } from './binance/services/binance-factory.service';
import { BancoPlazaFactoryService } from './banco-plaza/services/banco-plaza-factory.service';

import { BankProductController } from './bank-product.controller';
import { BankProductFactoryService } from './bank-product-factory.service';
import { ManageBankProductService } from './services/manage-bank-product.service';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { SessionModule } from '../auth/session/session.module';

import { BanescoModule } from './banesco/banesco.module';
import { BinanceModule } from './binance/binance.module';
import { BancoPlazaModule } from './banco-plaza/banco-plaza.module';
import { BancaribeModule } from './bancaribe/bancaribe.module';

@Module({
  controllers: [BankProductController],
  imports: [
    EncryptionModule,
    SessionModule,
    BanescoModule,
    BinanceModule,
    BancoPlazaModule,
    BancaribeModule,
  ],
  providers: [
    BancaribeFactoryService,
    BanescoFactoryService,
    BinanceFactoryService,
    BancoPlazaFactoryService,
    BankProductFactoryService,
    ManageBankProductService,
  ],
  exports: [BankProductFactoryService, ManageBankProductService],
})
export class BankConnectorsModule {}
