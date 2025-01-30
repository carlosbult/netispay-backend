import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculatePaymentDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amountUSD: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  bankProductId: number;
}
