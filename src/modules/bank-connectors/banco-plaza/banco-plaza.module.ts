import { Module } from '@nestjs/common';
import { BancoPlazaFactoryService } from './services/banco-plaza-factory.service';
import { BancoPlazaC2PService } from './services/c2p.service';
import { BancoPlazaController } from './banco-plaza.controller';
import { EncryptionModule } from '../../encryption/encryption.module';
import { BancoPlazaAdapter } from './banco-plaza.adapter';
import { SessionModule } from 'src/modules/auth/session/session.module';

@Module({
  imports: [EncryptionModule, SessionModule],

  controllers: [BancoPlazaController],
  providers: [
    BancoPlazaFactoryService,
    BancoPlazaC2PService,
    BancoPlazaAdapter,
  ],
  exports: [BancoPlazaFactoryService, BancoPlazaC2PService, BancoPlazaAdapter],
})
export class BancoPlazaModule {}
