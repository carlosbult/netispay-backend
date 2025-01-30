import { Global, Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { InitializationService } from './initialization.service';
import { GlobalConfigInitializationService } from './services/global-config.initialization.service';
import { CommissionInitializationService } from './services/commission.initialization.service';
import { BankInitializationService } from './services/bank.initialization.service';
import { NetworkManagerInitializationService } from './services/network-manager.initialization.service';
import { BankProductInitializationService } from './services/bank-product.initialization.service';
import { IspInitializationService } from './services/isp.initialization.service';
import { AdminUserInitializationService } from './services/admin-user.initialization.service';
import { InitializationProvider } from './initialization.provider';

@Global()
@Module({
  imports: [EncryptionModule],
  providers: [
    InitializationService,
    GlobalConfigInitializationService,
    CommissionInitializationService,
    BankInitializationService,
    NetworkManagerInitializationService,
    BankProductInitializationService,
    IspInitializationService,
    AdminUserInitializationService,
    InitializationProvider,
  ],
  exports: [InitializationService],
})
export class InitializationModule {}
