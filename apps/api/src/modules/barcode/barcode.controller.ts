import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { BarcodeService } from './barcode.service';

@ApiTags('barcode')
@ApiBearerAuth()
@Controller('barcode')
export class BarcodeController {
  constructor(private readonly service: BarcodeService) {}

  @Get(':value')
  @Header('Content-Type', 'image/png')
  @ApiQuery({ name: 'type', required: false, enum: ['code128', 'ean13'] })
  @ApiOperation({ summary: 'Generate a barcode PNG for a value' })
  async barcode(
    @Param('value') value: string,
    @Res() res: Response,
    @Query('type') type?: 'code128' | 'ean13',
  ): Promise<void> {
    const png = await this.service.generateBarcode(value, type ?? 'code128');
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  }

  @Get('qr/:value')
  @Header('Content-Type', 'image/png')
  @ApiOperation({ summary: 'Generate a QR-code PNG for a value' })
  async qr(@Param('value') value: string, @Res() res: Response): Promise<void> {
    const png = await this.service.generateQrCode(value);
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  }
}
