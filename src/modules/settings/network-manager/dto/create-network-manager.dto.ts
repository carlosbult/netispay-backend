import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateNetworkManagerDto {
  @ApiProperty({ description: 'Nombre del gestor de red' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL de la API', required: false })
  @IsOptional()
  @IsString()
  api_url?: string;

  @ApiProperty({ description: 'API Key', required: false })
  @IsOptional()
  @IsString()
  api_key?: string;

  @ApiProperty({ description: 'API Secret', required: false })
  @IsOptional()
  @IsString()
  api_secret?: string;
}
