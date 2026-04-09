import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import type { EmailSenderPort } from '../../domain/email/email-sender.port';
import type { SendEmailDto } from '../../domain/email/send-email.dto';

@Injectable()
export class SendGridEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(SendGridEmailAdapter.name);

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('SENDGRID_API_KEY', '');
    if (key) {
      sgMail.setApiKey(key);
    }
  }

  async sendEmail(payload: SendEmailDto): Promise<void> {
    const from = this.config.get<string>('MAIL_FROM', '');
    const to = Array.isArray(payload.to) ? payload.to : [payload.to];

    try {
      await sgMail.send({
        to,
        from,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString('base64'),
          type: a.contentType,
          disposition: 'attachment',
          contentId: a.cid,
        })),
      });
    } catch (err) {
      this.logger.error('Fallo al enviar correo con SendGrid', err instanceof Error ? err.stack : err);
      throw err;
    }
  }
}
