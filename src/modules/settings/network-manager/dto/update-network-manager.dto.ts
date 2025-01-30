import { PartialType } from '@nestjs/swagger';
import { CreateNetworkManagerDto } from './create-network-manager.dto';

export class UpdateNetworkManagerDto extends PartialType(
  CreateNetworkManagerDto,
) {}
