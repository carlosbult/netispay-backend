import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MikrowispAdapter } from '../mikrowisp.adapter';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'MikrowispAdapter',
      useFactory: (
        prisma: PrismaService,
        encryptionService: EncryptionService,
      ) => new MikrowispAdapter(prisma, encryptionService),
      inject: [PrismaService, EncryptionService],
    },
    PrismaService,
    EncryptionService,
  ],
  exports: [UserService],
})
export class MikrowispUserModule {}
