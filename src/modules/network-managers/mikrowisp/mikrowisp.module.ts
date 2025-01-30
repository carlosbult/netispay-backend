import { Module } from '@nestjs/common';
import { MikrowispService } from './mikrowisp.service';
import { MikrowispAdapter } from './mikrowisp.adapter';
import { MikrowispInvoiceModule } from './invoices/invoice.module';
import { MikrowispUserModule } from './users/user.module';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

@Module({
  imports: [MikrowispInvoiceModule, MikrowispUserModule],
  providers: [
    MikrowispService,
    MikrowispAdapter,
    PrismaService,
    EncryptionService,
  ],
})
export class MikrowispModule {}
