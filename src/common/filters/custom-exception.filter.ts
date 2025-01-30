import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomException } from '../exceptions/custom-exception';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof CustomException) {
      const exceptionResponse = exception.getResponse() as any;
      status = exception.getStatus();
      errorResponse = {
        ...exceptionResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      errorResponse = {
        statusCode: status,
        errorCode: exceptionResponse.error || 'HTTP_EXCEPTION',
        message: exceptionResponse.message || exception.message,
        details: null,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message;
      errorResponse.details = exception.stack;
    }

    response.status(status).send(errorResponse);
  }
}
