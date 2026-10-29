import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorDto } from '@dice/contracts';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { DomainError } from './domain-error';

/** Domain error code → HTTP status (ADR 0002). Unlisted codes are treated as server bugs. */
const STATUS_BY_CODE: Record<string, HttpStatus> = {
  INVALID_USERNAME: HttpStatus.BAD_REQUEST,
  INVALID_WINNING_SCORE: HttpStatus.BAD_REQUEST,
  SELF_PLAY: HttpStatus.BAD_REQUEST,
  NOT_A_PLAYER: HttpStatus.FORBIDDEN,
  NOT_YOUR_TURN: HttpStatus.FORBIDDEN,
  GAME_NOT_FOUND: HttpStatus.NOT_FOUND,
  GAME_NOT_IN_PROGRESS: HttpStatus.CONFLICT,
};

/** Renders every error as ApiErrorDto: domain errors via STATUS_BY_CODE, Nest HttpExceptions as-is. */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const { statusCode, message } = this.describe(exception);
    const body: ApiErrorDto = { statusCode, error: STATUS_CODES[statusCode] ?? 'Error', message };
    host.switchToHttp().getResponse<Response>().status(statusCode).json(body);
  }

  private describe(exception: unknown): Pick<ApiErrorDto, 'statusCode' | 'message'> {
    if (exception instanceof DomainError) {
      const statusCode = STATUS_BY_CODE[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      return { statusCode, message: exception.message };
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && 'message' in response
          ? (response as { message: string | string[] }).message
          : exception.message;
      return { statusCode: exception.getStatus(), message };
    }
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
  }
}
