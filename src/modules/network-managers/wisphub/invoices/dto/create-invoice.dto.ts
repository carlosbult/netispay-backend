import { BaseMikrowispDto } from '../../dto/base-wisphub.dto';

export class CreateInvoiceDto extends BaseMikrowispDto {
  idcliente: number;
  vencimiento: string;
}
