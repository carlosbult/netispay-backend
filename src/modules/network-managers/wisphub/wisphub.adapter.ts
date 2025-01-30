import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { getNetworkManagerConfig } from 'src/common/utils/network-manager-config.util';

@Injectable()
export class WisphubAdapter {
  private client: AxiosInstance;
  private defaultToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private async initializeClient() {
    try {
      const config = await getNetworkManagerConfig(
        this.prisma,
        this.encryptionService,
        'WISPHUB',
      );
      this.client = axios.create({
        baseURL: config.apiUrl,
        headers: {
          Authorization: `Api-Key ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      this.defaultToken = config.apiKey;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error initializing WISPHUB client',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async get(endpoint: string): Promise<any> {
    if (!this.client) {
      await this.initializeClient();
    }
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    if (!this.client) {
      await this.initializeClient();
    }
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof CustomException) {
      throw error;
    }

    throw new CustomException({
      message:
        error.response?.data.detail ||
        error.message ||
        'Error in Wisphub API request',
      statusCode: error.response.status || HttpStatus.BAD_REQUEST,
      errorCode: error.response.statusText || ErrorCode.BAD_REQUEST,
      details: error.response?.data || error.message,
    });
  }
}
