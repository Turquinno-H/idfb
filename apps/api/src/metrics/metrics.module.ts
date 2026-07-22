import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { MetricsInterceptorProvider } from './metrics.interceptor';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsInterceptorProvider],
  exports: [MetricsService],
})
export class MetricsModule {}
