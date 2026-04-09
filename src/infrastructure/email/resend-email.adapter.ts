  import { Injectable, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { Resend } from 'resend';
  import type { EmailSenderPort } from '../../domain/email/email-sender.port';
  import type { SendEmailDto } from '../../domain/email/send-email.dto';

  @Injectable()
  export class ResendEmailAdapter implements EmailSenderPort {
    private readonly logger = new Logger(ResendEmailAdapter.name);
    private readonly client: Resend;

    constructor(private readonly config: ConfigService) {
      const apiKey = this.config.get<string>('RESEND_API_KEY', '');
      this.client = new Resend(apiKey);
    }

    async sendEmail(payload: SendEmailDto): Promise<void> {
      const from = this.config.get<string>('MAIL_FROM', 'ttamitesmigratitios@tm.dev');
      const to = Array.isArray(payload.to) ? payload.to : [payload.to];

      try {
        const { data, error } = await this.client.emails.send({
          from,
          to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          replyTo: payload.replyTo,
          attachments: payload.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
        });
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('Resend devolvió una respuesta vacía');
        }
      } catch (err) {
        this.logger.error('Fallo al enviar correo con Resend', err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  }
