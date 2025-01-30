import { Controller, Post, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { GetInvoiceByIdDto } from '../../dto/getBillsData.dto';
import { PaidInvoiceDto } from './dto/paid-invoice.dto';
import { DeleteInvoiceDto } from './dto/delete-invoice.dto';
import { DeleteTransactionMkwsp } from './dto/delete-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('MikroWISP Invoices')
@Controller('mikrowisp/invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear una nueva factura en MikroWISP' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Post('list')
  @ApiOperation({ summary: 'Obtener lista de facturas' })
  @ApiBody({ type: GetInvoicesDto })
  @ApiResponse({
    status: 200,
    description: 'Lista de facturas obtenida exitosamente',
  })
  getInvoices(@Body() getInvoicesDto: GetInvoicesDto) {
    return this.invoiceService.getInvoices(getInvoicesDto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Registrar pago de factura' })
  @ApiBody({ type: PaidInvoiceDto })
  @ApiResponse({ status: 200, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al procesar el pago' })
  payInvoice(@Body() paidInvoiceDto: PaidInvoiceDto) {
    return this.invoiceService.payInvoice(paidInvoiceDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Eliminar una factura' })
  @ApiBody({ type: DeleteInvoiceDto })
  @ApiResponse({ status: 200, description: 'Factura eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  deleteInvoice(@Body() deleteInvoiceDto: DeleteInvoiceDto) {
    return this.invoiceService.deleteInvoice(deleteInvoiceDto);
  }

  @Post('delete-transaction')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiBody({ type: DeleteTransactionMkwsp })
  @ApiResponse({
    status: 200,
    description: 'Transacción eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  deleteTransaction(@Body() deleteTransactionDto: DeleteTransactionMkwsp) {
    return this.invoiceService.deleteTransaction(deleteTransactionDto);
  }
}
