import { Controller, Post, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { GetInvoiceByIdDto } from '../../dto/getBillsData.dto';
import { PaidInvoiceDto } from './dto/paid-invoice.dto';
import { DeleteInvoiceDto } from './dto/delete-invoice.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';

@Controller('wisphub/invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('create')
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Post('list')
  getInvoices(@Body() getInvoicesDto: GetInvoicesDto) {
    return this.invoiceService.getInvoices(getInvoicesDto);
  }

  // @Post('details')
  // getInvoice(@Body() getInvoiceDto: GetInvoiceByIdDto) {
  //   return this.invoiceService.getInvoiceById(getInvoiceDto);
  // }

  @Post('pay')
  payInvoice(@Body() paidInvoiceDto: PaidInvoiceDto) {
    return this.invoiceService.payInvoice(paidInvoiceDto);
  }

  @Post('delete')
  deleteInvoice(@Body() deleteInvoiceDto: DeleteInvoiceDto) {
    return this.invoiceService.deleteInvoice(deleteInvoiceDto);
  }

  @Post('delete-transaction')
  deleteTransaction(@Body() deleteTransactionDto: DeleteTransactionDto) {
    return this.invoiceService.deleteTransaction(deleteTransactionDto);
  }
}
