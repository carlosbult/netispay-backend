import { BinanceTransactionData } from 'src/modules/bank-connectors/binance/interfaces/binance.interface';

declare module '@binance/connector' {
  import { AxiosResponse } from 'axios';

  interface BinancePayHistoryResponse<T = BinanceTransactionData> {
    code: string;
    message: string;
    data: T[];
    success: boolean;
  }

  export class Spot {
    constructor(apiKey: string, apiSecret: string);

    payHistory(params?: {
      startTime?: number;
      endTime?: number;
      limit?: number;
      recvWindow?: number;
    }): Promise<AxiosResponse<BinancePayHistoryResponse>>;
  }
}
