import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { BanescoPayButtonDto } from '../dto/payButton.dto';
import { bank_products_name, payment_status, currencies } from '@prisma/client';
import { BanescoAdapter } from '../banesco.adapter';
import { generateUniqueId } from 'src/common/utils/generateUniqueId';
import { base64Encode } from 'src/common/utils/base64Encode';
import { BaseBankProductService } from '../../services/base-bank-product.service';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaymentResponse } from 'src/modules/bank-connectors/interfaces/bank-product.interface';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { NODE_ENV } from 'src/config';

@Injectable()
export class BanescoPayButtonService extends BaseBankProductService {
  private banescoAdapter: BanescoAdapter;

  constructor(
    protected prisma: PrismaService,
    protected encryptionService: EncryptionService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {
    super(prisma, encryptionService, cacheManager);
  }

  async generatePaymentData(
    data: BanescoPayButtonDto,
    userId: string,
  ): Promise<any> {
    if (!this.bankProductConfig) {
      await this.getBankProductConfig(bank_products_name.PAY_BUTTON, '0134');
    }
    try {
      const transactionId = generateUniqueId(22);

      const payload = {
        userId,
        cedula: '',
        monto: data.monto,
        idtramite: '',
        comprobante: transactionId,
        concepto: data.concepto,
        timestamp: new Date().toISOString(),
      };

      const signing = `${this.bankProductConfig.api_key}${payload.cedula}${payload.monto}${payload.idtramite}${payload.comprobante}`;
      const firma = this.encryptionService.hmacSignature(
        this.bankProductConfig.api_secret,
        signing,
      );

      return {
        ...payload,
        apikey: this.bankProductConfig.api_key,
        firma,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in generatePaymentData (payButton.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async processPayment(data: BanescoPayButtonDto): Promise<any> {
    if (!this.bankProductConfig) {
      await this.getBankProductConfig(bank_products_name.PAY_BUTTON, '0134');
    }
    try {
      // Mockup para entorno de pruebas
      if (NODE_ENV === 'development') {
        return this.mockProcessPayment(data);
      }

      const signing = `${this.bankProductConfig.api_key}${data.transactionId}`;
      const firma = this.encryptionService.hmacSignature(
        this.bankProductConfig.api_secret,
        signing,
      );
      const toConvert = {
        nroComprobante: data.transactionId,
        apiKey: this.bankProductConfig.api_key,
        firma,
      };
      const hash = base64Encode(toConvert);

      let banescoResponse = await this.banescoAdapter.verifyPayment(hash);

      if (banescoResponse?.detalle?.estatus !== 1) {
        const banescoStatus = banescoResponse?.detalle?.estatus;

        if ([2, 3, 6].includes(banescoStatus)) {
          return this.handleErrorPayment(banescoResponse);
        }

        if ([4, 5].includes(banescoStatus)) {
          await new Promise((resolve) => setTimeout(resolve, 15000));
          banescoResponse = await this.banescoAdapter.verifyPayment(hash);

          if (banescoResponse.detalle.estatus !== 1) {
            return this.handleErrorPayment({
              ...banescoResponse,
              transactionId: data.transactionId,
            });
          }
        }
      }

      if (banescoResponse?.detalle?.estatus === 1) {
        return this.handleSuccessfulPayment({
          ...banescoResponse,
          transactionId: data.transactionId,
        });
      }
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in processPayment (payButton.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  // Método mock para entorno de pruebas
  private async mockProcessPayment(
    data: BanescoPayButtonDto,
  ): Promise<PaymentResponse> {
    try {
      const mockResponse = {
        detalle: {
          estatus: 1,
          nro_referencia_banco: '123456789',
          valor2: data.monto,
        },
        transactionId: data.transactionId,
      };

      return this.handleSuccessfulPayment(mockResponse);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in mockProcessPayment (payButton.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async handleErrorPayment(banescoResponse: any): Promise<PaymentResponse> {
    try {
      const errorCode = banescoResponse?.detalle?.estatus.toString();
      const errorMessage = this.getBanescoErrorMessage(errorCode);

      const transaction = await this.createTransactionRecord({
        bankReference: banescoResponse?.nro_referencia_banco,
        intermediateId: banescoResponse.transactionId,
        amount: parseFloat(banescoResponse?.detalle?.valor2 || '0'),
        currency: currencies.VES,
        status: payment_status.FAILED,
        errorCode,
        errorMessage,
        bankResponse: banescoResponse,
        clientProfileId: banescoResponse.clientProfileId,
      });

      return this.createPaymentResponse({
        success: false,
        transaction,
        bankReference: banescoResponse?.nro_referencia_banco,
        amount: parseFloat(banescoResponse?.detalle?.valor2 || '0'),
        currency: currencies.VES,
        status: payment_status.FAILED,
        errorCode,
        errorMessage,
        bankProduct: bank_products_name.PAY_BUTTON,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in handleErrorPayment (payButton.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async handleSuccessfulPayment(
    banescoResponse: any,
  ): Promise<PaymentResponse> {
    try {
      const transaction = await this.createTransactionRecord({
        bankReference: banescoResponse.detalle.nro_referencia_banco,
        intermediateId: banescoResponse.transactionId,
        amount: parseFloat(banescoResponse.detalle.valor2),
        currency: currencies.VES,
        status: payment_status.SUCCESS,
        bankResponse: banescoResponse,
        clientProfileId: banescoResponse.clientProfileId,
      });

      return this.createPaymentResponse({
        success: true,
        transaction,
        bankReference: banescoResponse.detalle.nro_referencia_banco,
        amount: parseFloat(banescoResponse.detalle.valor2),
        currency: currencies.VES,
        status: payment_status.SUCCESS,
        bankCode: '0134',
        bankProduct: bank_products_name.PAY_BUTTON,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in handleSuccessfulPayment (payButton.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  private getBanescoErrorMessage(errorCode: string): string {
    const errorMessages = {
      '2': 'Cancelado por el cliente',
      '3': 'Rechazado por el banco',
      '4': 'Error de comunicación',
      '5': 'Error técnico',
      '6': 'Error de plataforma',
    };
    return errorMessages[errorCode] || 'Error desconocido';
  }

  async transformPaymentData(
    data: BanescoPayButtonDto,
  ): Promise<BanescoPayButtonDto> {
    return data;
  }
}
