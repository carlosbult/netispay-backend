import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MikrowispAdapter } from '../mikrowisp.adapter';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
// import { SessionModule } from 'src/modules/auth/session/session.module';

@Module({
  // imports: [SessionModule],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
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
  exports: [InvoiceService],
})
export class MikrowispInvoiceModule {}
