import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import {
  // BankProduct,
  PaymentResponse,
  processPayment,
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

  async processPayment(data: processPayment): Promise<PaymentResponse> {
    if (!this.bankProductConfig) {
      await this.getBankProductConfig(bank_products_name.C2P, '0138');
    }

    const paymentData = await this.transformPaymentData(data);

    const transactionId = generateUniqueId(22);

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
          clientProfileId: data.clientProfileId,
          transactionId,
        });
      }

      return this.handleSuccessfulPayment({
        ...result.data,
        ...paymentData,
        clientProfileId: data.clientProfileId,
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
        clientProfileId: data.clientProfileId,
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
        errorMessage: data.descripcionSistema || data.descripcionCliente,
        errorCode: data.codigoBanco,
        bankResponse: data.rawResponse,
        clientProfileId: data.clientProfileId,
      });

      return this.createPaymentResponse({
        success: false,
        transaction,
        amount: data.monto,
        currency: 'VES',
        status: payment_status.FAILED,
        errorCode: data.codigoBanco,
        errorMessage: data.descripcionSistema || data.descripcionCliente,
        bankMessage: data.descripcionCliente,
        bankProduct: bank_products_name.C2P,
      });
    } catch (error) {
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

  async transformPaymentData(data: processPayment): Promise<BancoPlazaC2PDto> {
    const paymentData = {
      banco: data.bankCode,
      id: data.documentId,
      telefonoPagador: data.phoneNumber,
      monto: data.amount,
      token: data.otp,

      telefonoCobrador: this.bankProductConfig.properties.find(
        (p) => p.property_key === 'telefonoCobrador',
      )?.property_value,
      motivo: this.bankProductConfig.properties.find(
        (p) => p.property_key === 'motivo',
      )?.property_value,
      origen: this.bankProductConfig.properties.find(
        (p) => p.property_key === 'origen',
      )?.property_value,
    };

    console.log('paymentData', paymentData);

    return paymentData;
  }
}
