import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { bank_products_name } from '@prisma/client';

class InvoiceItemDto {
  @ApiProperty({ description: 'ID de la factura' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Monto a pagar' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class PayInvoiceDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Código del banco' })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({
    description: 'Tipo de producto bancario',
    enum: bank_products_name,
  })
  @IsEnum(bank_products_name)
  @IsNotEmpty()
  productType: bank_products_name;

  @ApiProperty({ description: 'Monto esperado' })
  @IsNumber()
  @IsNotEmpty()
  expectedAmount: number;

  @ApiProperty({ description: 'Permitir pago parcial' })
  @IsBoolean()
  @IsNotEmpty()
  allowPartialPayment: boolean;

  @ApiProperty({ description: 'Saldo aplicado' })
  @IsNumber()
  @IsOptional()
  balanceApplied?: number;

  @ApiProperty({ description: 'Datos del pago' })
  @IsObject()
  @IsNotEmpty()
  paymentData: Record<string, any>;

  @ApiProperty({
    description: 'Lista de facturas a pagar',
    type: [InvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsNotEmpty()
  invoices: InvoiceItemDto[];
}
