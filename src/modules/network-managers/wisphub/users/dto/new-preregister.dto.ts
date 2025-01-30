import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class NewPreRegistroDto extends BaseMikrowispDto {
  cliente: string;
  cedula: string;
  direccion: string;
  telefono?: string;
  movil?: string;
  email?: string;
  notas?: string;
  fecha_instalacion?: string;
}
