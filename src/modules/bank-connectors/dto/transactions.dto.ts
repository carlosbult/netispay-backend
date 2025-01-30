import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { currencies } from '@prisma/client';

export class TransactionBaseDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: currencies;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;
}
