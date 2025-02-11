import { Injectable, PipeTransform, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BinanceTransactionDto } from '../../bank-connectors/binance/dto/transaction.dto';
import { BanescoPayButtonDto } from '../../bank-connectors/banesco/dto/payButton.dto';
import { BancoPlazaC2PDto } from '../../bank-connectors/banco-plaza/dto/c2p.dto';
import { bank_products_name } from '@prisma/client';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class PaymentDataPipe implements PipeTransform {
  private getDtoClass(bankCode: string, productType: bank_products_name) {
    const dtoMapping = {
      BNB: {
        [bank_products_name.VERIFICATION_API]: BinanceTransactionDto,
      },
      '0134': {
        [bank_products_name.PAY_BUTTON]: BanescoPayButtonDto,
      },
      '0138': {
        [bank_products_name.C2P]: BancoPlazaC2PDto,
      },
    };

    const selectedDto = dtoMapping[bankCode]?.[productType];
    if (!selectedDto) {
      throw new CustomException({
        message: `No se encontró un DTO válido para el banco ${bankCode} y producto ${productType}`,
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
      });
    }

    return selectedDto;
  }

  async transform(value: any) {
    try {
      const { bankCode, productType, paymentData } = value;

      // Obtener el DTO correspondiente
      const DtoClass = this.getDtoClass(bankCode, productType);

      // Transformar los datos al DTO
      const dtoInstance = plainToInstance(DtoClass, paymentData);

      // Validar la instancia del DTO
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));

        throw new CustomException({
          message: 'Error de validación en los datos de pago',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
          details: errorMessages,
        });
      }

      // Actualizar paymentData con los datos validados
      value.paymentData = dtoInstance;
      return value;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error en la validación de datos de pago',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
