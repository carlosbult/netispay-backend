import { Module } from '@nestjs/common';
import { BancoPlazaFactoryService } from './services/banco-plaza-factory.service';
import { BancoPlazaC2PService } from './services/c2p.service';
import { BancoPlazaController } from './banco-plaza.controller';
import { EncryptionModule } from '../../encryption/encryption.module';
import { BancoPlazaAdapter } from './banco-plaza.adapter';

@Module({
  imports: [EncryptionModule],
  controllers: [BancoPlazaController],
  providers: [
    BancoPlazaFactoryService,
    BancoPlazaC2PService,
    BancoPlazaAdapter,
  ],
  exports: [BancoPlazaFactoryService, BancoPlazaC2PService, BancoPlazaAdapter],
})
export class BancoPlazaModule {}
