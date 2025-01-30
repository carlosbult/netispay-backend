import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

export class ListInstallDto extends BaseMikrowispDto {
  estado?: string;
  cedula?: string;
}
