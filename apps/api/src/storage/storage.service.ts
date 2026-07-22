import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
import type { AppConfig } from '../config/configuration';

export interface UploadResult {
  storageKey: string;
  storageBucket: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: MinioClient;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const minio = this.configService.get<AppConfig['minio']>('app.minio')!;
    this.bucket = minio.bucket;
    this.client = new MinioClient({
      endPoint: minio.endpoint,
      port: minio.port,
      useSSL: minio.useSSL,
      accessKey: minio.accessKey,
      secretKey: minio.secretKey,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created MinIO bucket "${this.bucket}"`);
      }
    } catch (error) {
      this.logger.warn(
        `MinIO not reachable at startup, storage operations will fail until it is available: ${(error as Error).message}`,
      );
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    companyId: string,
  ): Promise<UploadResult> {
    const extension = originalName.includes('.')
      ? originalName.split('.').pop()
      : undefined;
    const storageKey = `${companyId}/${randomUUID()}${extension ? `.${extension}` : ''}`;

    await this.client.putObject(
      this.bucket,
      storageKey,
      buffer,
      buffer.length,
      {
        'Content-Type': mimeType,
      },
    );

    return {
      storageKey,
      storageBucket: this.bucket,
      size: buffer.length,
      mimeType,
    };
  }

  async getPresignedDownloadUrl(
    storageKey: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(
      this.bucket,
      storageKey,
      expirySeconds,
    );
  }

  async remove(storageKey: string): Promise<void> {
    await this.client.removeObject(this.bucket, storageKey);
  }
}
