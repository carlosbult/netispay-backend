import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class PaidInvoiceDto extends BaseMikrowispDto {
  idfactura: number;
  pasarela: string;
  cantidad: number;
  idtransaccion: string;
  bankCode: string;
  clientProfileId: number;
  adminProfileId?: number;
  transactionId: number;
  parcial?: string;
}
