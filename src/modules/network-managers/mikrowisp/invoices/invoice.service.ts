import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { MikrowispAdapter } from '../mikrowisp.adapter';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { GetInvoiceByIdDto } from './dto/get-invoice.dto';
import { PaidInvoiceDto } from './dto/paid-invoice.dto';
import { DeleteInvoiceDto } from './dto/delete-invoice.dto';
import { DeleteTransactionMkwsp } from './dto/delete-transaction.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('MikrowispAdapter') private readonly adapter: MikrowispAdapter,
  ) {}

  async createInvoice(data: CreateInvoiceDto) {
    return this.adapter.post('/CreateInvoice', data);
  }

  async getInvoices(data: GetInvoicesDto) {
    try {
      const response = await this.adapter.post('/GetInvoices', data);

      if (response.estado === 'error') {
        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      const dataToResponse = response.facturas.map((factura: any) => ({
        invoiceId: factura.id,
        issueDate: factura.emitido,
        dueDate: factura.vencimiento,
        paymentDate: factura.fechapago || null,
        status: factura.estado,
        balance: parseFloat(factura.saldo),
        discount: 0,
        total: parseFloat(factura.total),
        subTotal: parseFloat(factura.subtotal),
        tax: parseFloat(factura.impuesto),
        paymentMethod: factura.formapago,
        clientId: factura.idcliente,
        reference: factura.oxxo_referencia || '',
        transactions: factura.operaciones
          ? factura.operaciones.map((op: any) => ({
              transactionId: op.id_operacion,
              paymentDate: op.fecha_pago,
              amount: parseFloat(op.cobrado),
              paymentMethod: op.forma_pago,
              reference: op.transaccion,
              commission: parseFloat(op.comision),
              description: op.descripcion || '',
            }))
          : undefined,
      }));

      return dataToResponse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoices Mikrowisp',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async getInvoiceById(data: GetInvoiceByIdDto) {
    try {
      const response = await this.adapter.post('/GetInvoice', data);

      if (response.estado === 'error') {
        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      const { factura, items } = response;

      const dataToResponse = {
        invoiceId: factura.id,
        issueDate: factura.emitido,
        dueDate: factura.vencimiento,
        paymentDate: factura.fechapago || null,
        status: factura.estado,
        balance: parseFloat(factura.saldo),
        discount: 0, // MikroWISP no proporciona descuento, lo dejamos en 0
        total: parseFloat(factura.total),
        subTotal: parseFloat(factura.subtotal),
        tax: parseFloat(factura.impuesto),
        paymentMethod: factura.formapago,
        reference: factura.oxxo_referencia || '',
        items: items.map((item: any) => ({
          description: item.descrp,
          quantity: parseInt(item.unidades),
          unitPrice: parseFloat(item.precio),
          total: parseFloat(item.total),
        })),
      };
      return dataToResponse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoiceById Mikrowisp',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async payInvoice(data: PaidInvoiceDto) {
    try {
      const response = await this.adapter.post('/PaidInvoice', data);

      console.log('response de payInvoice: ', response);

      if (response.estado === 'error') {
        if (
          response.mensaje.includes('Nº de transacción') &&
          response.mensaje.includes('ya fue registrado')
        ) {
          const match = response.mensaje.match(/\((\d+)\)/);
          if (match) {
            const duplicateTransactionId = match[1];
            const newTransactionId = `${data.bankCode}-${duplicateTransactionId}`;
            data.idtransaccion = newTransactionId;

            return await this.adapter.post('/PaidInvoice', data);
          }
        }

        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
          details: response,
        });
      }

      const updatedInvoice = await this.adapter.post('/GetInvoice', {
        idfactura: data.idfactura,
      });

      return { response, updatedInvoice };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in payInvoice (mikrowisp/invoice.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async deleteInvoice(data: DeleteInvoiceDto) {
    return this.adapter.post('/DeleteInvoice', data);
  }

  async deleteTransaction(data: DeleteTransactionMkwsp) {
    try {
      const response = await this.adapter.post('/DeleteTransaccion', data);

      if (response.estado === 'error') {
        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      return response;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in deleteTransaction (mikrowisp/invoice.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
