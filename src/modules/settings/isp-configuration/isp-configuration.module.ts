import { Module } from '@nestjs/common';
import { IspConfigurationService } from './isp-configuration.service';
import { IspConfigurationController } from './isp-configuration.controller';
import { PrismaService } from 'prisma/prisma.service';
import { SessionModule } from 'src/modules/auth/session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [IspConfigurationController],
  providers: [IspConfigurationService, PrismaService],
  exports: [IspConfigurationService],
})
export class IspConfigurationModule {}
