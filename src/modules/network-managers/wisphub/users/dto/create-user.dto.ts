import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class CreateUserDto extends BaseMikrowispDto {
  nombre: string;
  cedula?: string;
  correo?: string;
  telefono?: string;
  movil?: string;
  direccion_principal?: string;
}
