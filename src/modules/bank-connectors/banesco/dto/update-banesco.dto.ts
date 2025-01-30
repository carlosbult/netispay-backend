import { PartialType } from '@nestjs/swagger';
import { CreateBanescoDto } from './create-banesco.dto';

export class UpdateBanescoDto extends PartialType(CreateBanescoDto) {}
