import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class GetClientDetailsDto extends BaseMikrowispDto {
  idcliente: number;
  telefono?: number;
  cedula?: string;
}
