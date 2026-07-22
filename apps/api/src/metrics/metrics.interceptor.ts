import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const start = process.hrtime.bigint();
    const route = request.route?.path ?? request.path;

    return next.handle().pipe(
      tap({
        next: () => this.recordMetric(start, request.method, route, response.statusCode),
        error: () => this.recordMetric(start, request.method, route, response.statusCode || 500),
      }),
    );
  }

  private recordMetric(startTime: bigint, method: string, route: string, statusCode: number): void {
    const durationSeconds = Number(process.hrtime.bigint() - startTime) / 1e9;
    const labels = { method, route, status_code: String(statusCode) };
    this.metricsService.httpRequestDuration.observe(labels, durationSeconds);
    this.metricsService.httpRequestsTotal.inc(labels);
  }
}

export const MetricsInterceptorProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: MetricsInterceptor,
};
