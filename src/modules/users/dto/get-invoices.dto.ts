import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsPositive,
  Max,
  Min,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetInvoicesDto {
  @ApiPropertyOptional({
    description: 'ID del usuario',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({
    description: 'Estado de la factura (0: pendiente, 1: pagada, 2: vencida)',
    type: Number,
    example: 1,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  status?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados a retornar',
    type: Number,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit?: number;
}

export class GetInvoiceByIdDto {
  @ApiPropertyOptional({
    description: 'IDs de las facturas separados por coma',
    type: [Number],
    example: [2107, 2014],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  invoiceIds: number[];

  constructor(invoiceIdsString: string) {
    this.invoiceIds = invoiceIdsString
      ? invoiceIdsString.split(',').map(Number)
      : [];
  }
}
