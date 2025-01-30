import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
// import { GetClientDetailsDto } from './users/dto/get-client-details.dto';
import { InvoiceService } from './invoices/invoice.service';
import { PaidInvoiceDto } from './invoices/dto/paid-invoice.dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UserService } from './users/user.service';
// import { PaymentResponse } from 'src/modules/bank-connectors/interfaces/bank-product.interface';
import {
  NetworkManager,
  UserDataResponse,
  InvoiceResponse,
  NetworkManagerInvoiceResponse,
} from '../interfaces/network-manager.interface';
import { GetUserDataDto } from '../dto/getUserData.dto';
import { GetBillsDataDto, GetInvoiceByIdDto } from '../dto/getBillsData.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { DeleteTransactionDto } from './invoices/dto/delete-transaction.dto';
import { UpdateUserDto } from './dto/update-mikrowisp.dto';

@Injectable()
export class MikrowispService implements NetworkManager {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async createUser(data: CreateUserDto): Promise<any> {
    try {
      return this.userService.createUser(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in createUser (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async updateUser(data: UpdateUserDto): Promise<any> {
    try {
      // Preparar datos para el administrador de red
      const networkManagerData = {
        idcliente: data.userId,
        datos: {
          nombre: data.name,
          correo: data.email,
          telefono: data.phone,
          direccion: data.address,
          codigo: data.password,
        },
      };

      // Actualizar solo en el administrador de red
      const response = await this.userService.updateUser(networkManagerData);

      return {
        success: true,
        message: 'Usuario actualizado exitosamente en el administrador de red',
        data: response,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in updateUser (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async getUserData(data: GetUserDataDto): Promise<UserDataResponse> {
    const { userId } = data;
    try {
      return this.userService.getClientDetails({
        idcliente: userId,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getUserData (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async getInvoices(data: GetBillsDataDto): Promise<InvoiceResponse[]> {
    const { userId, status, limit } = data;
    try {
      return this.invoiceService.getInvoices({
        idcliente: userId,
        estado: status,
        limit,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoices (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async getInvoiceById(data: GetInvoiceByIdDto): Promise<InvoiceResponse> {
    try {
      return this.invoiceService.getInvoiceById({
        idfactura: data.invoiceId,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoiceById (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async payInvoice(data: PaidInvoiceDto): Promise<any> {
    try {
      return this.invoiceService.payInvoice(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in payInvoice (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async activateService(data: any): Promise<any> {
    try {
      return this.userService.activateService(data);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in activateService (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async processPayment({
    invoiceId,
    paymentMethod,
    amount,
    transactionId,
    bankCode,
    clientProfileId,
    adminProfileId,
    allowPartialPayment,
  }: {
    invoiceId: number;
    paymentMethod: string;
    amount: number;
    transactionId: string;
    bankCode: string;
    clientProfileId: number;
    adminProfileId?: number;
    allowPartialPayment: boolean;
  }): Promise<NetworkManagerInvoiceResponse> {
    try {
      const invoiceResponse = await this.invoiceService.payInvoice({
        idfactura: invoiceId,
        pasarela: paymentMethod,
        cantidad: amount,
        idtransaccion: transactionId,
        bankCode: bankCode,
        clientProfileId,
        adminProfileId,
        transactionId: parseInt(transactionId),
        parcial: allowPartialPayment,
      });

      return {
        invoiceId: invoiceId.toString(),
        status: invoiceResponse.response.estado,
        paidAmount: amount,
        transactionReference: transactionId,
        paymentDate: new Date().toISOString(),
        originalInvoiceData: invoiceResponse.response,
        updatedInvoiceData: invoiceResponse.updatedInvoice,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in processPayment (mikrowisp.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async deleteTransaction(data: DeleteTransactionDto): Promise<any> {
    try {
      // 1. Eliminar cada pago en el administrador de red
      const deletePromises = data.invoice_payments.map(async (payment) => {
        await this.invoiceService.deleteTransaction({
          factura: payment.invoice_id,
        });
      });

      await Promise.all(deletePromises);

      return {
        success: true,
        message: 'Transacción eliminada exitosamente',
        deletedTransactionId: data.transactionId,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error eliminando la transacción',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
