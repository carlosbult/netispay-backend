import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

export class GetInvoicesDto extends BaseMikrowispDto {
  limit?: number;
  estado?: number; // 0 = Pagadas, 1 = No pagadas, 2 = Anuladas, vacío = Cualquier estado
  idcliente?: number;
  fechapago?: string; // Formato de fecha YYYY-MM-DD
  formapago?: string;
}
