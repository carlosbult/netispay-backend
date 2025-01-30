import { Module } from '@nestjs/common';
import { BinanceFactoryService } from './services/binance-factory.service';
import { BinanceTransactionService } from './services/transaction.service';
import { BinanceController } from './binance.controller';
import { EncryptionModule } from '../../encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [BinanceController],
  providers: [BinanceFactoryService, BinanceTransactionService],
  exports: [BinanceFactoryService, BinanceTransactionService],
})
export class BinanceModule {}
