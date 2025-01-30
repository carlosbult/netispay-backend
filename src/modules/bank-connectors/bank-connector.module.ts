import { Module } from '@nestjs/common';
import { BancaribeFactoryService } from './bancaribe/services/bancaribe-factory.service';
import { BanescoFactoryService } from './banesco/services/banesco-factory.service';
import { BankProductFactoryService } from './bank-product-factory.service';
import { BinanceFactoryService } from './binance/services/binance-factory.service';
import { BankProductController } from './bank-product.controller';
import { ManageBankProductService } from './services/manage-bank-product.service';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { SessionModule } from '../auth/session/session.module';

@Module({
  controllers: [BankProductController],
  imports: [EncryptionModule, SessionModule],
  providers: [
    BancaribeFactoryService,
    BanescoFactoryService,
    BinanceFactoryService,
    BankProductFactoryService,
    ManageBankProductService,
  ],
  exports: [BankProductFactoryService, ManageBankProductService],
})
export class BankConnectorsModule {}
