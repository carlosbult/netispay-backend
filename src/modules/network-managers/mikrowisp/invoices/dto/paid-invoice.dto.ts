import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

export class PaidInvoiceDto extends BaseMikrowispDto {
  idfactura: number;
  pasarela: string;
  cantidad?: number;
  comision?: number;
  idtransaccion?: string;
  fecha?: string;
  parcial?: boolean;
  bankCode?: string;
  clientProfileId: number;
  adminProfileId?: number;
  transactionId: number;
}
