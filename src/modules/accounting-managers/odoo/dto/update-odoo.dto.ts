import { PartialType } from '@nestjs/swagger';
import { CreateOdooDto } from './create-odoo.dto';

export class UpdateOdooDto extends PartialType(CreateOdooDto) {}
