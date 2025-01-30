export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
}

export interface BinanceTransactionData {
  uid: number;
  counterpartyId: number;
  orderId: string;
  note?: string;
  orderType: string;
  transactionId: string;
  transactionTime: number;
  amount: string;
  currency: string;
  walletType: number;
  walletTypes: (number | string)[];
  fundsDetail: Array<{
    currency: string;
    amount: string;
    walletAssetCost: Record<string, string>;
  }>;
  payerInfo: {
    name?: string;
    type?: string;
    binanceId?: string;
    accountId?: number;
    unmaskData?: boolean;
  };
  receiverInfo: {
    name?: string;
    type?: string;
    email?: string;
    binanceId?: number;
    accountId?: string;
    countryCode?: string;
    phoneNumber?: string;
    mobileCode?: string;
    unmaskData?: boolean;
  };
  totalPaymentFee: string;
}

export interface BinanceApiResponse<T> {
  code: string;
  message: string;
  data: T;
  success: boolean;
}

export interface StandardBinanceResponse {
  success: boolean;
  message: string;
  data: BinanceTransactionData | null;
}
