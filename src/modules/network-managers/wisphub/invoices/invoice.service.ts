import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { WisphubAdapter } from '../wisphub.adapter';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { GetInvoiceByIdDto } from './dto/get-invoice.dto';
import { PaidInvoiceDto } from './dto/paid-invoice.dto';
import { DeleteInvoiceDto } from './dto/delete-invoice.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('WisphubAdapter') private readonly adapter: WisphubAdapter,
  ) {}

  async createInvoice(data: CreateInvoiceDto) {
    return this.adapter.post('/CreateInvoice', data);
  }

  async getInvoices(data: GetInvoicesDto) {
    try {
      console.log('data: ', data);
      const response = await this.adapter.get('/facturas');
      // console.log('response invoices: ', JSON.stringify(response, null, 2));

      const dataToResponse = response.results.map((factura: any) => ({
        invoiceId: factura.id_factura,
        issueDate: factura.fecha_emision,
        dueDate: factura.fecha_vencimiento,
        paymentDate: factura.fecha_pago || null,
        status: factura.estado,
        balance: factura.saldo,
        discount: factura.descuento,
        total: factura.total,
        subTotal: factura.sub_total,
        tax: factura.impuestos_total,
        paymentMethod: factura.forma_pago.nombre || '',
        clientId: factura.idcliente,
        reference: factura.referencia || '',
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
        message: 'Error in getInvoices WISPHUB',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async getInvoiceById(invoiceId: GetInvoiceByIdDto) {
    try {
      const { idfactura } = invoiceId;
      const response = await this.adapter.get(`/facturas/${idfactura}`);

      const { articulos } = response;

      const dataToResponse = {
        invoiceId: response.id_factura,
        issueDate: response.fecha_emision,
        dueDate: response.fecha_vencimiento,
        paymentDate: response.fecha_pago || null,
        status: response.estado,
        balance: response.saldo,
        discount: response.descuento,
        paymentMethod: response.forma_pago,
        tax: response.impuestos_total,
        subTotal: response.sub_total,
        total: response.total,
        reference: response.oxxo_referencia || '',
        items: articulos.map((item: any) => ({
          description: item.descripcion,
          quantity: item.cantidad,
          unitPrice: parseFloat(item.precio),
          total: parseFloat(item.precio),
        })),
      };
      return dataToResponse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoiceById WISPHUB',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async payInvoice(data: PaidInvoiceDto) {
    return this.adapter.post('/PaidInvoice', data);
  }

  async deleteInvoice(data: DeleteInvoiceDto) {
    return this.adapter.post('/DeleteInvoice', data);
  }

  async deleteTransaction(data: DeleteTransactionDto) {
    return this.adapter.post('/DeleteTransaccion', data);
  }
}
