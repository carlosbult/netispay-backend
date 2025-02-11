import { Module } from '@nestjs/common';
import { UsersController } from './user/user.controller';
import { InvoicesController } from './invoices/invoices.controller';
import { UserCreationService } from './user/user-creation.service';
import { UserQueryService } from './user/user-query.service';
import { UserManagementService } from './user/user-management.service';
import { UserInvoicesService } from './invoices/invoices.service';
// import { MailService } from 'src/common/utils/sendMail';
import { NetworkManagersModule } from 'src/modules/network-managers/network-manager.module';
import { NetworkManagerFactoryService } from 'src/modules/network-managers/network-manager-factory.service';
import { BankProductFactoryService } from 'src/modules/bank-connectors/bank-product-factory.service';
import { BancaribeModule } from '../bank-connectors/bancaribe/bancaribe.module';
import { BanescoModule } from '../bank-connectors/banesco/banesco.module';
import { BinanceModule } from '../bank-connectors/binance/binance.module';
import { BancoPlazaModule } from '../bank-connectors/banco-plaza/banco-plaza.module';
import { AutomaticBalanceRegistrationService } from './invoices/automatic-balance-registration.service';
import { SessionModule } from '../auth/session/session.module';

@Module({
  imports: [
    NetworkManagersModule,
    BancaribeModule,
    BanescoModule,
    BinanceModule,
    BancoPlazaModule,
    SessionModule,
  ],
  controllers: [UsersController, InvoicesController],
  providers: [
    UserCreationService,
    UserQueryService,
    UserManagementService,
    UserInvoicesService,
    // MailService,
    NetworkManagerFactoryService,
    BankProductFactoryService,
    AutomaticBalanceRegistrationService,
  ],
})
export class UsersModule {}
