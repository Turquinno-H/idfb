import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { AppConfig } from '../config/configuration';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const mail = this.configService.get<AppConfig['mail']>('app.mail')!;
    this.from = mail.from;
    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.password } : undefined,
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.send({
      to,
      subject: 'IDFB ERP — Hoş Geldiniz',
      html: `<p>Merhaba ${firstName},</p><p>IDFB ERP platformuna hoş geldiniz. Hesabınız başarıyla oluşturuldu.</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    await this.send({
      to,
      subject: 'IDFB ERP — Şifre Sıfırlama',
      html: `<p>Şifrenizi sıfırlamak için kod: <strong>${resetToken}</strong></p><p>Bu kod 15 dakika içinde geçerliliğini yitirecektir.</p>`,
    });
  }
}
