import { Controller, Post, Body, HttpStatus, UseFilters } from '@nestjs/common';
import { BinanceTransactionService } from './services/transaction.service';
import { BinanceTransactionDto } from './dto/transaction.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { CustomExceptionFilter } from 'src/common/filters/custom-exception.filter';

@Controller('binance')
export class BinanceController {
  constructor(private readonly transactionService: BinanceTransactionService) {}

  @Post('/verify-transaction-by-order-id')
  @UseFilters(new CustomExceptionFilter())
  async verifyTransactionByOrderId(@Body() data: BinanceTransactionDto) {
    try {
      return await this.transactionService.processPayment(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al verificar transacción de Binance',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
