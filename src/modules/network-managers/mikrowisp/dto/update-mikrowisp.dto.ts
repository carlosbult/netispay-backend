import { PartialType } from '@nestjs/swagger';
import { CreateMikrowispDto } from './create-mikrowisp.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateMikrowispDto extends PartialType(CreateMikrowispDto) {}

export class UpdateUserDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
