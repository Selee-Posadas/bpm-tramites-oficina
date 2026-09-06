import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  BusinessRuleValidationException,
  ConcurrencyConflictException,
  DomainException,
  DuplicateEntityException,
  EntityNotFoundException,
  InvalidStateTransitionException,
  UnauthorizedActionException,
} from '@shared/domain/exceptions/domain.exception';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string | string[];
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Ha ocurrido un error inesperado';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | string[]) || exception.message;
        error = (resObj.error as string) || exception.name;
      } else {
        message = String(res);
        error = exception.name;
      }
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      error = 'Not Found';
      message = exception.message;
    } else if (exception instanceof UnauthorizedActionException) {
      status = HttpStatus.FORBIDDEN;
      error = 'Forbidden';
      message = exception.message;
    } else if (
      exception instanceof InvalidStateTransitionException ||
      exception instanceof BusinessRuleValidationException
    ) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      error = 'Unprocessable Entity';
      message = exception.message;
    } else if (
      exception instanceof ConcurrencyConflictException ||
      exception instanceof DuplicateEntityException
    ) {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = exception.message;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      error = 'Domain Rule Violation';
      message = exception.message;
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const errorPayload: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    };

    response.status(status).send(errorPayload);
  }
}
