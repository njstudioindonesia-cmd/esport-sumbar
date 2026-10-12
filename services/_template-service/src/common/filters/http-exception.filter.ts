import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger: StructuredLogger;

  constructor(serviceName: string) {
    this.logger = new StructuredLogger(serviceName);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        errorMessage = (resObj['message'] as string) || exception.message;
        errorCode = (resObj['error'] as string) || exception.name;
        details = resObj['details'] || (Array.isArray(resObj['message']) ? resObj['message'] : undefined);
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorCode = exception.name;
    }

    const errorPayload: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
      },
      correlationId: request.correlationId,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}`,
        exception instanceof Error ? exception : new Error(String(exception)),
        'GlobalHttpExceptionFilter',
        { status, details },
        request.correlationId,
      );
    } else {
      this.logger.warn(
        `Client error ${status} on ${request.method} ${request.url}: ${errorMessage}`,
        'GlobalHttpExceptionFilter',
        { status, details },
        request.correlationId,
      );
    }

    response.status(status).json(errorPayload);
  }
}
