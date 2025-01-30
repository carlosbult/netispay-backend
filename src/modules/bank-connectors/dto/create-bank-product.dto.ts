import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import {
  bank_products_name,
  currencies,
  
} from '@prisma/client';

export enum payment_category {
  BALANCE = 'BALANCE',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYMENT_LINK = 'PAYMENT_LINK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO'
}

export class CreateBankProductDto {
  @IsNumber()
  bank_id: number;

  @IsEnum(bank_products_name)
  name: bank_products_name;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsEnum(payment_category)
  @IsOptional()
  payment_category?: payment_category;

  @IsString()
  @IsOptional()
  api_url?: string;

  @IsString()
  @IsOptional()
  api_key?: string;

  @IsString()
  @IsOptional()
  api_secret?: string;

  @IsOptional()
  configurations?: {
    description?: string;
    bank_commission_rate: number;
    bank_operation_rate?: number;
    currency: currencies;
  }[];
}
