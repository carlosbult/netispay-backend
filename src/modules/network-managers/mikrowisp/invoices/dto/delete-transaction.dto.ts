import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Este DTO es para la API externa
export class DeleteTransactionDto {
  @ApiProperty({
    description: 'ID de la transacción a eliminar',
    example: 'TRANS-123456',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  invoice_payments: Array<any>;
}

// Este DTO es para la comunicación con MikroWISP
export class DeleteTransactionMkwsp {
  @ApiProperty({
    description: 'ID de la factura a eliminar',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  factura: string;
}
