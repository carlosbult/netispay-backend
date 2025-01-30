import { PartialType } from '@nestjs/swagger';
import { CreateMikrowispDto } from './create-wisphub.dto';

export class UpdateMikrowispDto extends PartialType(CreateMikrowispDto) {}
