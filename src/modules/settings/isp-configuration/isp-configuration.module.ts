import { Module } from '@nestjs/common';
import { IspConfigurationService } from './isp-configuration.service';
import { IspConfigurationController } from './isp-configuration.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [IspConfigurationController],
  providers: [IspConfigurationService, PrismaService],
  exports: [IspConfigurationService],
})
export class IspConfigurationModule {}
