import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/index.js';
import { isObject } from '../utils/index.js';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const code =
      isObject(exceptionResponse) && exceptionResponse.code
        ? exceptionResponse.code
        : this.mapStatusCode(status);

    let message: unknown =
      isObject(exceptionResponse) && exceptionResponse.message
        ? exceptionResponse.message
        : exception instanceof HttpException
          ? exception.message
          : ERROR_CODES.SYSTEM.INTERNAL_ERROR.message;

    if (Array.isArray(message)) {
      message = message.join('; ');
    }

    this.logger.error(
      `[${(request as unknown as any).requestId}] ${message}`,
      (exception as Error).stack,
    );

    const errorResponse = {
      code,
      message,
      timestamp: Date.now(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: (exception as Error).stack,
      }),
    };

    response.status(status).json(errorResponse);
  }

  private mapStatusCode(status: number): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION.INVALID_INPUT.code;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.AUTH.UNAUTHORIZED.code;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.COMMON.NOT_FOUND.code;
      case HttpStatus.REQUEST_TIMEOUT:
        return ERROR_CODES.COMMON.REQUEST_TIMEOUT.code;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.SYSTEM.INTERNAL_ERROR.code;
      default:
        return status;
    }
  }
}
