import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { WisphubAdapter } from '../wisphub.adapter';
import { PrismaService } from 'prisma/prisma.service';
import { WisphubModule } from '../wisphub.module';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'WisphubAdapter',
      useFactory: (
        prisma: PrismaService,
        encryptionService: EncryptionService,
      ) => new WisphubAdapter(prisma, encryptionService),
      inject: [PrismaService, EncryptionService],
    },
    PrismaService,
    EncryptionService,
  ],
  exports: [UserService],
})
export class WisphubUserModule {}
