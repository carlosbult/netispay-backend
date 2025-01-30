import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { typeOfPerson } from 'src/interfaces/user.types';

export class UserDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 1932 })
  @IsNotEmpty()
  @IsInt()
  network_manager_user_id: number;

  @ApiProperty({ example: 'UserName', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 1234567, required: false })
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiProperty({
    example: 'NATURAL',
    type: () => String,
    required: false,
  })
  @IsOptional()
  @IsEnum(typeOfPerson)
  type_of_person?: typeOfPerson;

  @ApiProperty({ example: 1234567, required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'el parral 4 avenidas', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
