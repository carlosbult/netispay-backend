import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor() {
    const globalSecret = process.env.GLOBAL_ENCRYPTION_SECRET;
    if (!globalSecret) {
      throw new Error(
        'GLOBAL_ENCRYPTION_SECRET no está configurado en las variables de entorno',
      );
    }
    this.secretKey = crypto.scryptSync(globalSecret, 'salt', 32);
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return Buffer.concat([iv, tag, encrypted]).toString('base64');
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in encrypt',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const buffer = Buffer.from(encryptedText, 'base64');

      const iv = buffer.subarray(0, 12);
      const tag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.secretKey,
        iv,
      );
      decipher.setAuthTag(tag);

      return decipher.update(encrypted) + decipher.final('utf8');
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in decrypt',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  hmacSignature(secret: string, data: string): string {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      // hmac.update(JSON.stringify(data));
      hmac.update(data);
      return hmac.digest('hex');
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in hmacSignature',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
