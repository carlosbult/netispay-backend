import { BaseMikrowispDto } from '../../dto/base-mikrowisp.dto';

export class CreateInvoiceDto extends BaseMikrowispDto {
  idcliente: number;
  vencimiento: string;
}
