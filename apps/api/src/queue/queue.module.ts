import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';

export const QUEUE_NAMES = {
  EMAIL: 'email',
  E_INVOICE: 'e-invoice',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.get<AppConfig['redis']>('app.redis')!;
        return {
          connection: {
            host: redis.host,
            port: redis.port,
            password: redis.password,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 500,
            removeOnFail: 1000,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.E_INVOICE },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.REPORTS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
