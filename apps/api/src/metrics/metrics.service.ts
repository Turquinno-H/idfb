import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry: client.Registry;
  readonly httpRequestDuration: client.Histogram<string>;
  readonly httpRequestsTotal: client.Counter<string>;

  constructor() {
    this.registry = new client.Registry();
    client.collectDefaultMetrics({
      register: this.registry,
      prefix: 'idfb_erp_',
    });

    this.httpRequestDuration = new client.Histogram({
      name: 'idfb_erp_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new client.Counter({
      name: 'idfb_erp_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
