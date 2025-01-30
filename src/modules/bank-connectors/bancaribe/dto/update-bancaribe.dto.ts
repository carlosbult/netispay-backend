import { PartialType } from '@nestjs/swagger';
import { CreateBancaribeDto } from './create-bancaribe.dto';

export class UpdateBancaribeDto extends PartialType(CreateBancaribeDto) {}
