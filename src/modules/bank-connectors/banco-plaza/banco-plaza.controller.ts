import { Controller, Post, Body, HttpStatus, UseFilters } from '@nestjs/common';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { CustomExceptionFilter } from 'src/common/filters/custom-exception.filter';
import { BancoPlazaC2PService } from './services/c2p.service';
import { processPayment } from '../interfaces/bank-product.interface';

@Controller('banco-plaza')
export class BancoPlazaController {
  constructor(private readonly c2pService: BancoPlazaC2PService) {}

  @Post('/generate-token')
  @UseFilters(new CustomExceptionFilter())
  async generateToken(@Body('id') id: string) {
    try {
      const token = await this.c2pService.generateToken(id);
      return { token };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al generar token de Banco Plaza',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @Post('/process-payment')
  @UseFilters(new CustomExceptionFilter())
  async processPayment(@Body() data: processPayment) {
    try {
      return await this.c2pService.processPayment(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al procesar pago C2P de Banco Plaza',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
