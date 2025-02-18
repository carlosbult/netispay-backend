import { Module } from '@nestjs/common';
import { NetworkManagerService } from './network-manager.service';
import { NetworkManagerController } from './network-manager.controller';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';
import { SessionModule } from 'src/modules/auth/session/session.module';
@Module({
  controllers: [NetworkManagerController],
  imports: [EncryptionModule, SessionModule],
  providers: [NetworkManagerService, PrismaService],
  exports: [NetworkManagerService],
})
export class NetworkManagerModule {}
