import { Module } from '@nestjs/common';
import { MikrowispFactoryService } from './mikrowisp/mikrowisp-factory.service';
import { MikrowispInvoiceModule } from './mikrowisp/invoices/invoice.module';
import { MikrowispUserModule } from './mikrowisp/users/user.module';
import { MikrowispService } from './mikrowisp/mikrowisp.service';
import { WisphubFactoryService } from './wisphub/wisphub-factory.service';
import { WisphubInvoiceModule } from './wisphub/invoices/invoice.module';
import { WisphubUserModule } from './wisphub/users/user.module';
import { WisphubService } from './wisphub/wisphub.service';
import { BankProductFactoryService } from '../bank-connectors/bank-product-factory.service';
import { BancaribeModule } from '../bank-connectors/bancaribe/bancaribe.module';
import { BanescoModule } from '../bank-connectors/banesco/banesco.module';
import { BinanceModule } from '../bank-connectors/binance/binance.module';
import { BancoPlazaModule } from '../bank-connectors/banco-plaza/banco-plaza.module';
// import { SessionModule } from '../auth/session/session.module';

@Module({
  imports: [
    MikrowispInvoiceModule,
    MikrowispUserModule,
    WisphubInvoiceModule,
    WisphubUserModule,
    BancaribeModule,
    BanescoModule,
    BinanceModule,
    BancoPlazaModule,
    // SessionModule,
  ],
  providers: [
    MikrowispFactoryService,
    MikrowispService,
    WisphubFactoryService,
    WisphubService,
    BankProductFactoryService,
  ],
  exports: [MikrowispFactoryService, WisphubFactoryService],
})
export class NetworkManagersModule {}
