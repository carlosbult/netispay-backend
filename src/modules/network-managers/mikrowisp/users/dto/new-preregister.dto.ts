import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

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
