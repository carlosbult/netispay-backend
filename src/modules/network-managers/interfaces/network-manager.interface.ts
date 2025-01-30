import { GetUserDataDto } from '../dto/getUserData.dto';
import { CreateUserDto } from '../mikrowisp/users/dto/create-user.dto';

export interface NetworkManager {
  /** Users */
  createUser(data: CreateUserDto): Promise<any>;
  updateUser(data: any): Promise<any>;
  getUserData(data: GetUserDataDto): Promise<UserDataResponse>;
  /** Invoices */
  getInvoices(data: any): Promise<InvoiceResponse[]>;
  getInvoiceById(data: any): Promise<any>;
  deleteTransaction(data: any): Promise<any>;
  // Del payInvoice se puede devolver la data completa para poder guardar en
  payInvoice(data: any): Promise<any>;
  processPayment(data: {
    invoiceId: number;
    paymentMethod: string;
    amount: number;
    transactionId: string;
    bankCode: string;
    clientProfileId: number;
    adminProfileId?: number;
    allowPartialPayment: boolean;
  }): Promise<NetworkManagerInvoiceResponse>;
  activateService(data: any): Promise<any>;
}

export interface UserDataResponse {
  name: string;
  status: string;
  address: string;
  dni: string;
  email: string;
  phone: string;
  services?: any[]; // Puedes definir una interfaz más específica si es necesario
  message?: string;
}

export interface InvoiceResponse {
  invoiceId: number;
  issueDate: string;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  balance: number;
  discount: number;
  total: number;
  subTotal: number;
  tax: number;
  paymentMethod: string;
  reference?: string;
  transactions?: TransactionResponse[];
  items?: InvoiceItemResponse[];
}

export interface TransactionResponse {
  transactionId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  commission?: number;
  description?: string;
}

export interface InvoiceItemResponse {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProcessPaymentResponse {
  success: boolean;
  paymentResult: {
    success: boolean;
    bankReference: string;
    transactionId: string | number;
    paymentMethod: string;
    bankCode: string;
    amount: number;
    status: string;
    message?: string;
  };
  networkManagerResponse: {
    invoices: NetworkManagerInvoiceResponse[];
    metadata?: Record<string, any>; // Datos adicionales específicos del network manager
  };
}

export interface NetworkManagerInvoiceResponse {
  invoiceId: string;
  status: string;
  paidAmount: number;
  transactionReference: string;
  paymentDate: string;
  originalInvoiceData: any;
  updatedInvoiceData: any;
}
