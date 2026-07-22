import { Injectable } from '@nestjs/common';
import { toBuffer as qrToBuffer } from 'qrcode';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  /** Renders a barcode PNG for the given value using the requested symbology. */
  async generateBarcode(value: string, type: 'code128' | 'ean13' = 'code128'): Promise<Buffer> {
    return bwipjs.toBuffer({
      bcid: type,
      text: value,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });
  }

  /** Renders a QR-code PNG for the given value. */
  async generateQrCode(value: string): Promise<Buffer> {
    return qrToBuffer(value, { errorCorrectionLevel: 'M', margin: 1, width: 300 });
  }
}
