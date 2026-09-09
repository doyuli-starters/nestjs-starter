import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto.js';
import { isObject } from '../utils/index.js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const code =
      isObject(exceptionResponse) && exceptionResponse.code
        ? (exceptionResponse.code as number)
        : status;
    const message =
      isObject(exceptionResponse) && exceptionResponse.message
        ? (exceptionResponse.message as string)
        : exception.message;

    const errorResponse = new ResponseDto(code, message, null, request.path);

    this.logger.error(
      `[${(request as unknown as any).requestId}] ${errorResponse.message}`,
    );

    response.status(status).json(errorResponse);
  }
}
