import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from 'src/interfaces/errorCodes';

export class CustomException extends HttpException {
  constructor({
    message,
    statusCode,
    errorCode,
    details,
  }: {
    message: string;
    statusCode: HttpStatus;
    errorCode: ErrorCode;
    details?: any;
  }) {
    super(
      {
        statusCode,
        errorCode,
        message,
        details,
      },
      statusCode,
    );
  }
}
