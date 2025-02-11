import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import {
  // BankProduct,
  PaymentResponse,
} from '../../interfaces/bank-product.interface';
import { BancoPlazaC2PDto } from '../dto/c2p.dto';
import { BaseBankProductService } from '../../services/base-bank-product.service';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { bank_products_name, payment_status } from '@prisma/client';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { BancoPlazaAdapter } from '../banco-plaza.adapter';
import { generateUniqueId } from 'src/common/utils/generateUniqueId';

@Injectable()
export class BancoPlazaC2PService extends BaseBankProductService {
  private readonly bancoPlazaAdapter: BancoPlazaAdapter;
  constructor(
    protected prisma: PrismaService,
    protected encryptionService: EncryptionService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    bancoPlazaAdapter: BancoPlazaAdapter,
  ) {
    super(prisma, encryptionService, cacheManager);
    this.bancoPlazaAdapter = bancoPlazaAdapter;
  }

  /**
   * Genera un token para autorizar un pago C2P
   * @param id Identificación del pagador
   * @returns Token generado
   */
  async generateToken(id: string): Promise<string> {
    try {
      if (!this.bankProductConfig) {
        await this.getBankProductConfig(bank_products_name.C2P, '0138');
      }

      return await this.bancoPlazaAdapter.generateToken(
        id,
        this.bankProductConfig.api_key,
        this.bankProductConfig.api_secret,
        this.bankProductConfig.api_url,
      );
    } catch (error) {
      console.log('error', error);
      throw new CustomException({
        message: 'Error al generar el token',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async processPayment(data: BancoPlazaC2PDto): Promise<PaymentResponse> {
    if (!this.bankProductConfig) {
      await this.getBankProductConfig(bank_products_name.C2P, '0138');
    }
    const transactionId = generateUniqueId(22);
    const paymentData = {
      ...data,
    };

    try {
      const result = await this.bancoPlazaAdapter.processPayment(
        paymentData,
        this.bankProductConfig.api_key,
        this.bankProductConfig.api_secret,
        this.bankProductConfig.api_url,
      );

      if (!result.success) {
        return this.handleErrorPayment({
          ...result.errorData,
          ...paymentData,
          transactionId,
        });
      }

      console.log('result de processPayment: ', result.data);

      return this.handleSuccessfulPayment({
        ...result.data,
        ...paymentData,
        transactionId,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al procesar el pago',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.PAYMENT_PROCESSING_FAILED,
        details: error,
      });
    }
  }

  async handleSuccessfulPayment(data: any): Promise<PaymentResponse> {
    try {
      const transaction = await this.createTransactionRecord({
        intermediateId: data.transactionId,
        bankReference: data.referencia,
        amount: data.monto,
        currency: 'VES',
        status: payment_status.SUCCESS,
        bankResponse: data,
      });

      const paymentData = {
        ...data,
        success: true,
        transaction,
        bankReference: data.referencia,
        amount: data.monto,
        currency: 'VES',
        status: payment_status.SUCCESS,
        bankProduct: bank_products_name.C2P,
      };

      return this.createPaymentResponse(paymentData);
    } catch (error) {
      console.log('error de handleSuccessfulPayment: ', error);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al crear la transacción',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.PAYMENT_PROCESSING_FAILED,
        details: error,
      });
    }
  }

  // Implementación requerida por la clase abstracta
  async handleErrorPayment(data: any): Promise<PaymentResponse> {
    try {
      const transaction = await this.createTransactionRecord({
        intermediateId: data.transactionId,
        amount: data.monto,
        currency: 'VES',
        status: payment_status.FAILED,
        errorMessage: data.descripcionSistema,
        errorCode: data.codigoBanco,
        bankResponse: data.rawResponse,
      });

      return this.createPaymentResponse({
        success: false,
        transaction,
        amount: data.monto,
        currency: 'VES',
        status: payment_status.FAILED,
        errorMessage: data.descripcionSistema,
        bankProduct: bank_products_name.C2P,
      });
    } catch (error) {
      console.log('error de handleFailedPayment: ', error);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al crear la transacción',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.PAYMENT_PROCESSING_FAILED,
        details: error,
      });
    }
  }
}
