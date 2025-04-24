import {
  // IsNotEmpty,
  IsString,
  IsNumber,
  IsIn,
  Length,
  Matches,
  IsOptional,
  Min,
  // IsEnum,
} from 'class-validator';
// import { currencies } from '@prisma/client';
// import { TransactionBaseDto } from '../../dto/transactions.dto';

export class BancoPlazaC2PDto {
  @IsString()
  @Length(4, 4, { message: 'Código de banco debe tener 4 dígitos' })
  banco: string;

  @IsString()
  @Length(12, 12, { message: 'ID debe tener 12 caracteres' })
  id: string;

  @IsString()
  @Length(10, 10, {
    message: 'Teléfono debe tener 10 dígitos sin el 0 inicial',
  })
  @Matches(/^4(12|14|16|24|26|28)\d{7}$/, {
    message: 'Formato de teléfono inválido',
  })
  telefonoPagador: string;

  @IsNumber()
  @Min(1000, { message: 'Monto mínimo es 1000' })
  monto: number;

  @IsString()
  @Length(8, 8, { message: 'Token debe tener 8 dígitos' })
  token: string;

  @IsString()
  @Length(10, 10, {
    message: 'Teléfono debe tener 10 dígitos sin el 0 inicial',
  })
  @Matches(/^4(12|14|16|24|26|28)\d{7}$/, {
    message: 'Formato de teléfono inválido',
  })
  @IsOptional()
  telefonoCobrador: string;

  @IsString()
  @Length(1, 35, { message: 'Motivo debe tener entre 1-35 caracteres' })
  @IsOptional()
  motivo: string;

  @IsIn(['07', '10', '11', '12'], { message: 'Origen inválido' })
  @IsOptional()
  origen: string;

  // Campos opcionales
  @IsOptional() @IsString() sucursal?: string;
  @IsOptional() @IsString() cajero?: string;
  @IsOptional() @IsString() caja?: string;
  @IsOptional() @IsString() lote?: string;
}
