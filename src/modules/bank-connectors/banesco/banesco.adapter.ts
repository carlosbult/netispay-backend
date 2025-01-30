import { HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

export class BanescoAdapter {
  private axiosInstance: AxiosInstance;
  private banescoURL: string;

  constructor(banescoURL: string) {
    this.banescoURL = banescoURL;
    this.axiosInstance = axios.create({
      baseURL: banescoURL,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  async verifyPayment(hash: string) {
    try {
      const response = await this.axiosInstance.post('/', hash);
      return response.data;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in Banesco verifyPayment',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
