import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import nodeProcess from 'node:process';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

type BasicRequest = {
  method?: string;
  url?: string;
  originalUrl?: string;
};

type BasicResponse = {
  statusCode?: number;
};

function now(): bigint {
  return typeof nodeProcess.hrtime?.bigint === 'function' ? nodeProcess.hrtime.bigint() : BigInt(Date.now()) * 1_000_000n;
}

function durationMs(startedAt: bigint): number {
  const diff = now() - startedAt;
  return Number(diff) / 1_000_000;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger = new Logger('HTTP')) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<BasicRequest>();
    const response = httpContext.getResponse<BasicResponse>();

    if (!request) {
      return next.handle();
    }

    const { method } = request;
    const url = (request.originalUrl || request.url || '').split('?')[0] || '/';
    const startedAt = now();

    const logSuccess = () => {
      const statusCode = response?.statusCode ?? 200;
      const ms = durationMs(startedAt).toFixed(2);
      this.logger.log(`${method} ${url} ${statusCode} - ${ms}ms`);
    };

    const logError = (error: unknown) => {
      const statusCode =
        typeof error === 'object' && error !== null && 'getStatus' in error && typeof (error as any).getStatus === 'function'
          ? (error as any).getStatus()
          : 500;
      const ms = durationMs(startedAt).toFixed(2);
      const message =
        typeof error === 'object' && error !== null && 'message' in error ? String((error as any).message) : 'Unhandled error';
      this.logger.error(`${method} ${url} ${statusCode} - ${ms}ms`, message);
    };

    return next.handle().pipe(
      tap({ next: logSuccess }),
      catchError((error: unknown) => {
        logError(error);
        throw error;
      })
    );
  }
}
