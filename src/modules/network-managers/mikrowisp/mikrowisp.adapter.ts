import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { getNetworkManagerConfig } from 'src/common/utils/network-manager-config.util';

@Injectable()
export class MikrowispAdapter {
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
        'MIKROWISP',
      );
      this.client = axios.create({
        baseURL: config.apiUrl,
      });
      this.defaultToken = config.apiKey;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error initializing mikrowisp client',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    try {
      if (!this.client) {
        await this.initializeClient();
      }

      console.log('data de post mikrowisp: ', data);

      const token = data.token || this.defaultToken;
      const response = await this.client.post(endpoint, {
        ...data,
        token,
      });

      console.log(
        'response de post mikrowisp: ',
        JSON.stringify(response.data, null, 2),
      );

      return response.data;
    } catch (error) {
      // console.log('error de post mikrowisp: ', error);
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in post to MIKROWISP ' + endpoint,
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
