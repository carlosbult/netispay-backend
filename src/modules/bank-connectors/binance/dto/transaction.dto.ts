import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { TransactionBaseDto } from '../../dto/transactions.dto';

export class BinanceTransactionDto extends TransactionBaseDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsString()
  coin?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  txId?: string;
}
