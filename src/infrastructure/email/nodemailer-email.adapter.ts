import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { EmailSenderPort } from '../../domain/email/email-sender.port';
import type { SendEmailDto } from '../../domain/email/send-email.dto';

@Injectable()
export class NodemailerEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(NodemailerEmailAdapter.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'sandbox.smtp.mailtrap.io');
    const port = this.config.get<number>('SMTP_PORT', 2525);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true';
    const user = this.config.get<string>('SMTP_USER', '');
    const pass = this.config.get<string>('SMTP_PASS', '');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && pass
          ? {
              user,
              pass,
            }
          : undefined,
    });
  }

  async sendEmail(payload: SendEmailDto): Promise<void> {
    const from = this.config.get<string>('MAIL_FROM', 'noreply@tm.local');
    try {
      await this.transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
          cid: a.cid,
        })),
      });
    } catch (err) {
      this.logger.error('Nodemailer send failed', err instanceof Error ? err.stack : err);
      throw err;
    }
  }
}
