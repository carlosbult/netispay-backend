import { Module } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { OdooController } from './odoo.controller';

@Module({
  controllers: [OdooController],
  providers: [OdooService],
})
export class OdooModule {}
