import { currencies, payment_status } from '@prisma/client';

export interface BankProduct {
  processPayment?(data: any): Promise<PaymentResponse>;
  refundPayment?(data: any): Promise<any>;
  transferFunds?(data: any): Promise<any>;
}

export interface BankProductConfig {
  id: number;
  bank_name: string;
  api_url: string;
  api_key: string;
  api_secret: string;
  bank_commission_rate: number;
  currentDolarRateId: number;
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
