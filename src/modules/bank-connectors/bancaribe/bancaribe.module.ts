import { Module } from '@nestjs/common';
import { BancaribeFactoryService } from './services/bancaribe-factory.service';

@Module({
  providers: [BancaribeFactoryService],
  exports: [BancaribeFactoryService],
})
export class BancaribeModule {}
