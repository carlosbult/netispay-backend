import {
  Controller,
  Post,
  Body,
  HttpCode,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentCalculationService } from './services/payment-calculator.service';
import { CalculatePaymentDto } from './dto/calculate-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session/session.guard';
import { GetSession } from '../auth/session/session.decorator';

@ApiTags('Currency Rates')
@Controller('currency-rates')
@UseGuards(SessionGuard)
export class CurrencyRatesController {
  constructor(
    private readonly paymentCalculationService: PaymentCalculationService,
  ) {}

  @Post('payment-calculator')
  @HttpCode(200)
  @ApiOperation({ summary: 'Calcula el pago en moneda local basado en USD' })
  @ApiBody({ type: CalculatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Cálculo exitoso',
    schema: {
      properties: {
        amountLocal: { type: 'number', description: 'Monto en moneda local' },
        rate: { type: 'number', description: 'Tasa de cambio aplicada' },
        bankProduct: {
          type: 'object',
          description: 'Detalles del producto bancario',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async calculatePayment(
    @Body(new ValidationPipe({ transform: true }))
    data: CalculatePaymentDto,
    @GetSession() session,
  ) {
    const result = await this.paymentCalculationService.calculatePayment(
      data.amountUSD,
      data.bankProductId,
      session.userId,
    );

    return { ...result };
  }
}
