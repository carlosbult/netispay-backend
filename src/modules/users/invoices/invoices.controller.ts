import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  UseFilters,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CustomExceptionFilter } from 'src/common/filters/custom-exception.filter';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { PayInvoiceDto } from '../dto/pay-invoice.dto';
// import { PaymentDataPipe } from '../pipes/payment-data.pipe';
import { UserInvoicesService } from './invoices.service';
import { GetInvoicesDto, GetInvoiceByIdDto } from '../dto/get-invoices.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly userInvoicesService: UserInvoicesService) {}

  @ApiCreatedResponse({
    description: 'Transacciones obtenidas exitosamente',
    type: GetInvoicesDto,
  })
  @ApiResponse({ status: 400, description: 'Error ' })
  @Get('/transactions')
  @UseFilters(new CustomExceptionFilter())
  getTransactions(@Query() filters: GetInvoicesDto) {
    try {
      return this.userInvoicesService.getTransactions(filters);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getTransactions',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @ApiCreatedResponse({
    description: 'Detalles de la factura obtenidos exitosamente',
    type: GetInvoicesDto,
  })
  @ApiResponse({ status: 400, description: 'Error ' })
  @Get('/')
  @UseFilters(new CustomExceptionFilter())
  getInvoices(@Query() filters: GetInvoicesDto) {
    try {
      return this.userInvoicesService.getInvoices(filters);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getInvoices',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @ApiCreatedResponse({
    description: 'Detalles de la factura obtenidos exitosamente',
    type: GetInvoiceByIdDto,
  })
  @ApiResponse({ status: 400, description: 'Error ' })
  @Get('/invoiceById')
  @UseFilters(new CustomExceptionFilter())
  getInvoiceById(@Query('invoiceIds') invoiceIds: string) {
    try {
      const filters = new GetInvoiceByIdDto(invoiceIds);
      return this.userInvoicesService.getInvoiceById(filters);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getInvoiceById',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @Post('payInvoice')
  @ApiBody({ type: PayInvoiceDto })
  @ApiCreatedResponse({ description: 'Pago registrado exitosamente' })
  @UseFilters(new CustomExceptionFilter())
  async processPayment(@Body() data: PayInvoiceDto) {
    try {
      return this.userInvoicesService.processPayment(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in processPayment',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @Delete('transaction/:id')
  @ApiOperation({ summary: 'Eliminar una transacción y sus pagos asociados' })
  @ApiResponse({
    status: 200,
    description: 'Transacción eliminada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al eliminar la transacción' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  @UseFilters(new CustomExceptionFilter())
  async deleteTransaction(@Param('id') transactionId: string) {
    try {
      return await this.userInvoicesService.deleteTransaction(transactionId);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error al eliminar la transacción',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
