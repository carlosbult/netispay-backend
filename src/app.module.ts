import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SessionModule } from './modules/auth/session/session.module';
import { BankConnectorsModule } from './modules/bank-connectors/bank-connector.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DolarRateScraperModule } from './modules/currency-rates/currency-rates.module';
import { UsersModule } from './modules/users/users.module';
import { InitializationModule } from './modules/initialization/initialization.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 24,
      max: 100000,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
    SessionModule,
    UsersModule,
    BankConnectorsModule,
    DolarRateScraperModule,
    SettingsModule,
    InitializationModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
