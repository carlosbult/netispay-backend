import { Module } from '@nestjs/common';
import { WisphubService } from './wisphub.service';
import { WisphubController } from './wisphub.controller';
import { WisphubAdapter } from './wisphub.adapter';
import { WisphubInvoiceModule } from './invoices/invoice.module';
import { WisphubUserModule } from './users/user.module';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BankProductFactoryService } from 'src/modules/bank-connectors/bank-product-factory.service';

@Module({
  imports: [WisphubInvoiceModule, WisphubUserModule],
  controllers: [WisphubController],
  providers: [
    WisphubService,
    WisphubAdapter,
    PrismaService,
    BankProductFactoryService,
    EncryptionService,
  ],
})
export class WisphubModule {}
