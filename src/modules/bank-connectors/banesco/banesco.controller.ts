import { Controller, Post, Body, HttpStatus, UseFilters } from '@nestjs/common';
import { BanescoPayButtonService } from './services/payButton.service';
import { BanescoPayButtonDto } from './dto/payButton.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { CustomExceptionFilter } from 'src/common/filters/custom-exception.filter';

@Controller('banesco')
export class BanescoController {
  constructor(private readonly payButtonService: BanescoPayButtonService) {}

  @Post('generate-payment-data')
  @UseFilters(new CustomExceptionFilter())
  async generatePaymentData(
    @Body() data: BanescoPayButtonDto,
    // @Req() request: Request,
  ) {
    // const userId = (request as any).user?.id;
    const userId = '12';

    if (!userId) {
      throw new CustomException({
        message: 'Usuario no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }
    return this.payButtonService.generatePaymentData(data, userId);
  }
}
