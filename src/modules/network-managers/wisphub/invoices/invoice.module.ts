import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { WisphubAdapter } from '../wisphub.adapter';
import { WisphubModule } from '../wisphub.module';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

@Module({
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
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
  exports: [InvoiceService],
})
export class WisphubInvoiceModule {}
