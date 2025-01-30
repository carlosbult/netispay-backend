import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { isp_commission_type } from '@prisma/client';

export class CreateIspConfigurationDto {
  @ApiProperty({ description: 'ID del ISP' })
  @IsNumber()
  isp_id: number;

  @ApiProperty({ description: 'Tasa IGTF', default: 3 })
  @IsNumber()
  @IsOptional()
  igtf_rate?: number;

  @ApiProperty({ description: 'Tasa IVA', default: 16 })
  @IsNumber()
  @IsOptional()
  iva_rate?: number;

  @ApiProperty({ description: 'Agregar IVA en VES', default: false })
  @IsBoolean()
  @IsOptional()
  add_iva_ves?: boolean;

  @ApiProperty({ description: 'Agregar IVA en USD', default: false })
  @IsBoolean()
  @IsOptional()
  add_iva_usd?: boolean;

  @ApiProperty({ description: 'Agregar IGTF', default: false })
  @IsBoolean()
  @IsOptional()
  add_igtf?: boolean;

  @ApiProperty({ description: 'Tipo de comisión', enum: isp_commission_type })
  @IsEnum(isp_commission_type)
  commission_type: isp_commission_type;

  @ApiProperty({ description: 'Permitir pago parcial', default: false })
  @IsBoolean()
  @IsOptional()
  allow_partial_payment?: boolean;

  @ApiProperty({ description: 'Subdominio de la instancia' })
  @IsString()
  @IsOptional()
  instance_subdomain?: string;

  @ApiProperty({ description: 'IP de la instancia' })
  @IsString()
  @IsOptional()
  instance_ip?: string;

  @ApiProperty({ description: 'Token de la instancia' })
  @IsString()
  @IsOptional()
  instance_token?: string;

  @ApiProperty({ description: 'Token del software administrativo' })
  @IsString()
  @IsOptional()
  admin_software_token?: string;
}
