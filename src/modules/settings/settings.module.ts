import { Module } from '@nestjs/common';
import { NetworkManagerModule } from './network-manager/network-manager.module';
import { IspConfigurationModule } from './isp-configuration/isp-configuration.module';
// import { SessionModule } from '../auth/session/session.module';

@Module({
  imports: [NetworkManagerModule, IspConfigurationModule],
  // SessionModule,
  exports: [NetworkManagerModule, IspConfigurationModule],
})
export class SettingsModule {}
