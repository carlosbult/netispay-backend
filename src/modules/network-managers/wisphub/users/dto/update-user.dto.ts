import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class UpdateUserDto extends BaseMikrowispDto {
  idcliente: number;
  datos: {
    nombre?: string;
    correo?: string;
    telefono?: string;
    movil?: string;
    cedula?: string;
    codigo?: string;
    direccion_principal?: string;
    campo_personalizado?: string;
  };
}
