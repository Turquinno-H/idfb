import { Module } from '@nestjs/common';
import { EDocumentsController } from './e-documents.controller';
import { EDocumentsService } from './e-documents.service';

@Module({
  controllers: [EDocumentsController],
  providers: [EDocumentsService],
  exports: [EDocumentsService],
})
export class EDocumentsModule {}
