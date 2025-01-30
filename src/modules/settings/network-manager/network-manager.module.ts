import { Module } from '@nestjs/common';
import { NetworkManagerService } from './network-manager.service';
import { NetworkManagerController } from './network-manager.controller';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionModule } from 'src/modules/encryption/encryption.module';

@Module({
  controllers: [NetworkManagerController],
  imports: [EncryptionModule],
  providers: [NetworkManagerService, PrismaService],
  exports: [NetworkManagerService],
})
export class NetworkManagerModule {}
