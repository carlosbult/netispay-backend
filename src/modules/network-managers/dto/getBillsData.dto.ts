export class GetBillsDataDto {
  userId: number;
  status?: number;
  limit?: number;
}

export class GetInvoiceByIdDto {
  invoiceId: number;
}
