import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GetClientDetailsDto } from './users/dto/get-client-details.dto';
import { InvoiceService } from './invoices/invoice.service';
import { PaidInvoiceDto } from './invoices/dto/paid-invoice.dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UserService } from './users/user.service';
import { BankProductFactoryService } from 'src/modules/bank-connectors/bank-product-factory.service';
import { bank_products_name } from '@prisma/client';
import { PaymentResponse } from 'src/modules/bank-connectors/interfaces/bank-product.interface';
import {
  NetworkManager,
  UserDataResponse,
  InvoiceResponse,
  ProcessPaymentResponse,
  NetworkManagerInvoiceResponse,
} from '../interfaces/network-manager.interface';
import { GetUserDataDto } from '../dto/getUserData.dto';
import { GetBillsDataDto, GetInvoiceByIdDto } from '../dto/getBillsData.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { UpdateUserDto } from './users/dto/update-user.dto';

@Injectable()
export class WisphubService implements NetworkManager {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
    private readonly bankProductFactory: BankProductFactoryService,
    private readonly prisma: PrismaService,
  ) {}

  async createUser(data: CreateUserDto): Promise<any> {
    return this.userService.createUser(data);
  }

  async updateUser(data: UpdateUserDto): Promise<any> {
    return this.userService.updateUser(data);
  }

  async getUserData(data: GetUserDataDto): Promise<UserDataResponse> {
    const { userId } = data;
    return this.userService.getClientDetails({
      idcliente: userId,
    });
  }

  async getInvoices(data: GetBillsDataDto): Promise<InvoiceResponse[]> {
    const { userId, status, limit } = data;
    return this.invoiceService.getInvoices({
      idcliente: userId,
      estado: status,
      limit,
    });
  }

  async getInvoiceById(data: GetInvoiceByIdDto): Promise<InvoiceResponse> {
    return this.invoiceService.getInvoiceById({
      idfactura: data.invoiceId,
    });
  }

  async payInvoice(data: PaidInvoiceDto): Promise<any> {
    return this.invoiceService.payInvoice(data);
  }

  async activateService(data: any): Promise<any> {
    return this.userService.activateService(data);
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
        parcial: allowPartialPayment ? 'true' : 'false',
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
        message: 'Error in processPayment (wisphub.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async deleteTransaction(data: any): Promise<any> {
    return this.invoiceService.deleteTransaction(data);
  }
}
