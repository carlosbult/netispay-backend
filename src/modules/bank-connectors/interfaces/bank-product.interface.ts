import { currencies, payment_status } from '@prisma/client';

export interface BankProduct {
  processPayment?(data: processPayment): Promise<PaymentResponse>;
  refundPayment?(data: any): Promise<any>;
  transferFunds?(data: any): Promise<any>;
}

export interface processPayment {
  // Datos fijos
  amount: number;
  currency: currencies;
  exchangeRate: number;
  // Datos variables
  bankCode?: string;
  otp?: string;
  transactionDate?: Date;
  documentId?: string;
  email?: string;
  phoneNumber?: string;
  reference?: string;
  ipClient?: string;
}

export interface BankProductConfig {
  id: number;
  bank_name: string;
  api_url: string;
  api_key: string;
  api_secret: string;
  bank_commission_rate: number;
  currentDolarRateId: number;
  properties: {
    property_key: string;
    property_value: string;
    title: string;
    description?: string;
  }[];
}

export interface PaymentResponse {
  success: boolean;
  transactionId: number;
  bankReference?: string;
  amount: number;
  currency: currencies;
  status: payment_status;
  errorCode?: string;
  errorMessage?: string;
  paymentMethod: string;
  bankCode?: string;
  isDuplicate?: boolean;
}
