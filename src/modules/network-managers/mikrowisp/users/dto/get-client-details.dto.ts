import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

export class GetClientDetailsDto extends BaseMikrowispDto {
  idcliente: number;
  telefono?: number;
  cedula?: string;
}
