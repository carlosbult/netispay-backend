import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';
import { administrativeRoles } from 'src/interfaces/user.types';

export class AdministrativeDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ADMIN', type: () => String })
  @IsNotEmpty()
  @IsString()
  role: administrativeRoles;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'UserName' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1234567 })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
