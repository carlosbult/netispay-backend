export interface AutomaticBalanceRegistrationDto {
  clientProfileId: number;
  transactionId: number;
  receivedAmountUsd: number;
  expectedAmountUsd: number;

  receivedAmountVes?: number;
}

export interface BalanceRegistrationResult {
  isRegistered: boolean;
  balanceId?: number;
  remainingAmountUsd: number;
  message: string;
}

export interface BalanceMovementDto {
  balanceInfo: {
    amountFromBalance: number;
    availableBalances: { balanceId: number; amountToUse: number }[];
  };
  clientProfileId: number;
  invoiceId: string;
  transactionId: number;
  networkManager: string;
  invoiceData: any;
}
