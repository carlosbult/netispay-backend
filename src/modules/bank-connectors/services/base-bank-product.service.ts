import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { bank_products_name, currencies, payment_status } from '@prisma/client';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BankProduct,
  BankProductConfig,
  processPayment,
  PaymentResponse,
} from '../interfaces/bank-product.interface';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export abstract class BaseBankProductService implements BankProduct {
  protected bankProductConfig: BankProductConfig;

  constructor(
    protected prisma: PrismaService,
    protected encryptionService: EncryptionService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {}

  protected async getBankProductConfig(
    productName: bank_products_name,
    bankCode: string,
  ) {
    try {
      const [bankProduct, currentDolarRate] = await Promise.all([
        this.prisma.bank_product.findFirst({
          where: {
            name: productName,
            banks: {
              code: bankCode,
            },
            is_active: true,
          },
          include: {
            banks: true,
            bank_product_specific_config: true,
            configurations: true,
          },
        }),

        this.prisma.dolar_rate.findFirst({
          orderBy: { created_at: 'desc' },
        }),
      ]);

      if (!bankProduct) {
        throw new CustomException({
          message: 'Bank product configuration not found',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      if (!currentDolarRate) {
        throw new CustomException({
          message: 'Dolar rate not found',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      this.bankProductConfig = {
        id: bankProduct.id,
        bank_name: bankProduct.banks.name,
        api_url: this.encryptionService.decrypt(bankProduct.api_url),
        api_key: this.encryptionService.decrypt(bankProduct.api_key),
        api_secret: this.encryptionService.decrypt(bankProduct.api_secret),
        bank_commission_rate:
          bankProduct.configurations[0].bank_commission_rate,
        currentDolarRateId: currentDolarRate.id,
        properties: bankProduct.bank_product_specific_config,
      };
    } catch (error) {
      console.error('Error getting bank product config', error);

      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error getting bank product config',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  protected async createTransactionRecord(data: {
    bankReference?: string;
    intermediateId: string;
    amount: number;
    currency: currencies;
    status: payment_status;
    errorCode?: string;
    errorMessage?: string;
    bankResponse: any;
    clientProfileId?: number;
  }) {
    console.log('createTransactionRecord data', data);
    try {
      return await this.prisma.transactions.create({
        data: {
          bank_product: {
            connect: {
              id: this.bankProductConfig.id,
            },
          },
          dolar_rate: {
            connect: {
              id: this.bankProductConfig.currentDolarRateId,
            },
          },
          bank_reference: data.bankReference,
          intermediate_id: data.intermediateId,
          amount: data.amount,
          currency: data.currency,
          payment_status: data.status,
          error_code: data.errorCode,
          error_message: data.errorMessage,
          bank_response: data.bankResponse,
          month_year: new Date().toISOString().slice(0, 7),
          // admin_profile: {
          //   connect: {
          //     id: data.adminId,
          //   },
          // },
          //   client_profile: data.clientProfileId
          //     ? {
          //         connect: {
          //           user_id: data.clientProfileId, // Cambiar 'id' por 'user_id'
          //         },
          //       }
          //     : undefined,
        },
      });
    } catch (error) {
      console.error('Error creating transaction record', error);
      throw new CustomException({
        message: 'Error creating transaction record',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  protected createPaymentResponse(data: {
    success: boolean;
    transaction: any;
    bankReference?: string;
    amount: number;
    currency: currencies;
    status: payment_status;
    errorCode?: string;
    errorMessage?: string;
    bankMessage?: string;
    bankCode?: string;
    bankProduct: bank_products_name;
  }): PaymentResponse {
    try {
      return {
        success: data.success,
        transactionId: data.transaction.id,
        bankReference: data.bankReference,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        bankMessage: data.bankMessage,
        paymentMethod: `${this.bankProductConfig.bank_name} - ${data.bankProduct}`,
        bankCode: data.bankCode,
      };
    } catch (error) {
      console.error('Error creating payment response', error);
      throw new CustomException({
        message: 'Error creating payment response',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  protected handleDuplicateTransaction(transaction: any): PaymentResponse {
    try {
      return {
        success: false,
        transactionId: transaction.id,
        bankReference: transaction.bank_reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.payment_status,
        errorCode: ErrorCode.DUPLICATE_TRANSACTION,
        errorMessage: `La transacción ya fue procesada previamente`,
        paymentMethod: `${this.bankProductConfig.bank_name} - ${transaction.bank_product.name}`,
        isDuplicate: true,
      };
    } catch (error) {
      console.error('Error handling duplicate transaction', error);
      throw new CustomException({
        message: 'Error handling duplicate transaction',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  abstract processPayment(data: processPayment): Promise<PaymentResponse>;
  abstract handleErrorPayment(data: any): Promise<PaymentResponse>;
  abstract handleSuccessfulPayment(data: any): Promise<PaymentResponse>;
  abstract transformPaymentData(data: any): Promise<any>;
}
