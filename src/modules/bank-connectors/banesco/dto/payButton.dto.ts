import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { TransactionBaseDto } from '../../dto/transactions.dto';

export class BanescoPayButtonDto extends TransactionBaseDto {
  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsNotEmpty()
  @IsString()
  monto: string;

  @IsOptional()
  @IsString()
  idtramite?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNotEmpty()
  @IsString()
  concepto: string;
}
