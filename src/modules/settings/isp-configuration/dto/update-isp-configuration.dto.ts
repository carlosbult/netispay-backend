import { PartialType } from '@nestjs/swagger';
import { CreateIspConfigurationDto } from './create-isp-configuration.dto';

export class UpdateIspConfigurationDto extends PartialType(
  CreateIspConfigurationDto,
) {}
