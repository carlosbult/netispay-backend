import { Module } from '@nestjs/common';
import { BanescoController } from './banesco.controller';
import { BanescoFactoryService } from './services/banesco-factory.service';
import { BanescoPayButtonService } from './services/payButton.service';
import { EncryptionModule } from '../../encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [BanescoController],
  providers: [BanescoFactoryService, BanescoPayButtonService],
  exports: [BanescoFactoryService, BanescoPayButtonService],
})
export class BanescoModule {}
