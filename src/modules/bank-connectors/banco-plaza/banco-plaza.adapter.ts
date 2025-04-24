import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import * as crypto from 'crypto';
import { BancoPlazaC2PDto } from './dto/c2p.dto';
import { BankResponse } from './interfaces/bank-response.interface';

@Injectable()
export class BancoPlazaAdapter {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generateSignature(
    path: string,
    nonce: string,
    body: any,
    apiSecret: string,
  ): string {
    const data = `${path}${nonce}${JSON.stringify(body)}`;
    return crypto.createHmac('sha384', apiSecret).update(data).digest('hex');
  }

  /**
   * Reversa un pago C2P de Banco Plaza
   * @param ref Referencia del pago a reversar
   * @param apiKey API Key de autenticación
   * @param apiSecret API Secret para firmar la petición
   * @param baseUrl URL base de la API
   * @returns Respuesta con el código de anulación
   */
  async reversePayment(
    ref: string,
    apiKey: string,
    apiSecret: string,
    baseUrl: string,
  ): Promise<any> {
    try {
      const path = `/v0/pagos/c2p/${ref}`;
      const nonce = (Date.now() * 1000).toString();
      const signature = this.generateSignature(path, nonce, {}, apiSecret);

      const response = await this.axios.delete(baseUrl + path, {
        headers: {
          'api-key': apiKey,
          nonce,
          'api-signature': signature,
        },
      });

      return response.data;
    } catch (error) {
      throw new CustomException({
        message: 'Error al reversar el pago en Banco Plaza',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
      });
    }
  }

  /**
   * Genera un token para autorizar un pago C2P
   * @param id Identificación del pagador
   * @param phoneNumber Teléfono afiliado del pagador (opcional)
   * @param apiKey API Key de autenticación
   * @param apiSecret API Secret para firmar la petición
   * @param baseUrl URL base de la API
   * @returns Token generado
   */
  async generateToken(
    id: string,
    apiKey: string,
    apiSecret: string,
    baseUrl: string,
  ): Promise<string> {
    try {
      const path = `/token/pagos/c2p/${id}`;
      const nonce = (Date.now() * 1000).toString();
      const signature = this.generateSignature(path, nonce, {}, apiSecret);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'api-signature': signature,
        nonce: nonce.toString(),
      };

      const response = await this.axios.get(baseUrl + path, {
        headers,
      });

      return response.data.token;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al generar el token en Banco Plaza',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error.response?.data || error.message,
      });
    }
  }

  /**
   * Procesa un pago C2P en Banco Plaza
   * @param data Datos del pago
   * @param apiKey API Key de autenticación
   * @param apiSecret API Secret para firmar la petición
   * @param baseUrl URL base de la API
   * @returns Respuesta con la referencia del pago
   */
  async processPayment(
    data: BancoPlazaC2PDto,
    apiKey: string,
    apiSecret: string,
    baseUrl: string,
  ): Promise<BankResponse> {
    const path = '/v0/pagos/c2p';
    const nonce = (Date.now() * 1000).toString();

    try {
      const signature = this.generateSignature(path, nonce, data, apiSecret);

      const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'api-signature': signature,
        nonce,
      };

      const response = await this.axios.post(`${baseUrl}${path}`, data, {
        headers,
      });

      return this.mapSuccessResponse(response);
    } catch (error) {
      return this.mapErrorResponse(error);
    }
  }

  private mapSuccessResponse(response: AxiosResponse): BankResponse {
    return {
      success: true,
      data: {
        referencia: response.data.referencia,
        codigoReverso: response.data.codigoReverso,
        metadata: {
          codigoRespuesta: response.headers.codigorespuesta,
          descripcionCliente: response.headers.descripcioncliente,
          descripcionSistema: response.headers.descripcionsistema,
          fechaHora: new Date(response.headers.fechahora),
        },
      },
    };
  }

  private mapErrorResponse(error: any): BankResponse {
    const errorResponse = error.response || {};
    const headers = errorResponse.headers || {};
    const data = errorResponse.data || {};

    return {
      success: false,
      errorData: {
        codigoBanco: headers.codigorespuesta || 'DESCONOCIDO',
        descripcionCliente:
          headers.descripcioncliente || 'Error en operación bancaria',
        descripcionSistema: headers.descripcionsistema || '',
        referencia: data.referencia || '',
        rawResponse: {
          ...errorResponse.headers,
          ...errorResponse.data,
          status: errorResponse.status,
        },
      },
    };
  }
}
