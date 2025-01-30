import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionController],
  providers: [SessionGuard, SessionService],
  exports: [SessionGuard, SessionService],
})
export class SessionModule {}
