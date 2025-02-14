import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Spot } from '@binance/connector';
import { BinanceTransactionDto } from '../dto/transaction.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BaseBankProductService } from '../../services/base-bank-product.service';
import {
  PaymentResponse,
  processPayment,
} from '../../interfaces/bank-product.interface';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { bank_products_name, payment_status, currencies } from '@prisma/client';
import { BinanceTransactionData } from '../interfaces/binance.interface';
import { formatDateParams } from '../utils/formatDate';
import { generateUniqueId } from 'src/common/utils/generateUniqueId';

@Injectable()
export class BinanceTransactionService extends BaseBankProductService {
  private client: Spot;

  constructor(
    protected prisma: PrismaService,
    protected encryptionService: EncryptionService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {
    super(prisma, encryptionService, cacheManager);
  }

  private async initializeBinanceClient() {
    if (!this.bankProductConfig) {
      await this.getBankProductConfig('VERIFICATION_API', 'BNB');
    }

    if (!this.client) {
      this.client = new Spot(
        this.bankProductConfig.api_key,
        this.bankProductConfig.api_secret,
      );
    }
  }

  async processPayment(data: processPayment): Promise<PaymentResponse> {
    try {
      await this.initializeBinanceClient();

      const paymentData = await this.transformPaymentData(data);
      const transactionId = generateUniqueId(22);

      // Verificar si la transacción ya existe
      const existingTransaction = await this.prisma.transactions.findFirst({
        where: {
          AND: [
            {
              bank_reference: paymentData.orderId,
            },
            {
              bank_product_id: this.bankProductConfig.id,
            },
            {
              payment_status: payment_status.SUCCESS,
            },
          ],
        },
        include: {
          bank_product: true,
        },
      });

      if (existingTransaction) {
        return this.handleDuplicateTransaction(existingTransaction);
      }

      // Obtener el historial de pagos de Binance
      const requestParams = formatDateParams({
        startTime: paymentData.startTime,
        endTime: paymentData.endTime,
      });
      const response = await this.client.payHistory(requestParams);

      const { data: binanceResponse } = response;

      if (!binanceResponse?.success || binanceResponse.code !== '000000') {
        return this.handleErrorPayment({
          errorMessage:
            binanceResponse?.message || 'Error en la respuesta de Binance',
          transactionData: { ...paymentData, transactionId },
        });
      }

      if (!binanceResponse.data?.length) {
        return this.handleErrorPayment({
          errorMessage:
            'No se encontraron transacciones en el período especificado',
          transactionData: { ...paymentData, transactionId },
        });
      }

      const verifiedTransaction = binanceResponse.data.find(
        (transaction: BinanceTransactionData) =>
          transaction.orderId === paymentData.orderId,
      );

      if (!verifiedTransaction) {
        return this.handleErrorPayment({
          errorMessage: `No se encontró la transacción especificada con el orderId: ${paymentData.orderId}`,
          transactionData: { ...paymentData, transactionId },
        });
      }

      return this.handleSuccessfulPayment({
        transactionData: { ...verifiedTransaction, transactionId },
        orderId: paymentData.orderId,
      });
    } catch (error) {
      console.log('error binance: ', error);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al procesar el pago en Binance',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /** HANDLE ERROR */
  async handleErrorPayment(data: {
    errorMessage: string;
    transactionData: any;
  }): Promise<PaymentResponse> {
    try {
      const transaction = await this.createTransactionRecord({
        intermediateId: data.transactionData.transactionId,
        amount: parseFloat(data.transactionData.amount || '0'),
        currency: currencies.USD,
        status: payment_status.FAILED,
        errorMessage: data.errorMessage,
        bankResponse: data.transactionData,
      });

      return this.createPaymentResponse({
        success: false,
        transaction,
        amount: parseFloat(data.transactionData.amount || '0'),
        currency: currencies.USD,
        status: payment_status.FAILED,
        errorMessage: data.errorMessage,
        bankProduct: bank_products_name.VERIFICATION_API,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al manejar el pago fallido en Binance',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /** HANDLE SUCCESS */
  async handleSuccessfulPayment(data: {
    transactionData: any;
    orderId: string;
  }): Promise<PaymentResponse> {
    try {
      const transaction = await this.createTransactionRecord({
        bankReference: data.orderId,
        intermediateId: data.transactionData.transactionId,
        amount: parseFloat(data.transactionData.amount),
        currency: currencies.USD,
        status: payment_status.SUCCESS,
        bankResponse: data.transactionData,
      });

      return this.createPaymentResponse({
        success: true,
        transaction,
        bankReference: data.orderId,
        amount: parseFloat(data.transactionData.amount),
        currency: currencies.USD,
        status: payment_status.SUCCESS,
        bankProduct: bank_products_name.VERIFICATION_API,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al manejar el pago exitoso en Binance',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async transformPaymentData(
    data: processPayment,
  ): Promise<BinanceTransactionDto> {
    // Verificar si data.transactionDate es una instancia de Date
    if (!(data.transactionDate instanceof Date)) {
      // Si no es una instancia de Date, intentar parsear la fecha
      data.transactionDate = new Date(data.transactionDate);
    }

    const paymentData = {
      orderId: data.reference,
      startTime: data.transactionDate.toISOString(),
      endTime: data.transactionDate.toISOString(),
      amount: data.amount,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
    };

    return paymentData;
  }
}
