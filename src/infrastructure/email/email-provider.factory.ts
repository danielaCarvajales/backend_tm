import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../domain/email/email-sender.port';
import { NodemailerEmailAdapter } from './nodemailer-email.adapter';
import { ResendEmailAdapter } from './resend-email.adapter';
import { SendGridEmailAdapter } from './sendgrid-email.adapter';

export type EmailProviderName = 'nodemailer' | 'resend' | 'sendgrid';

export function createEmailSenderAdapter(
  config: ConfigService,
): EmailSenderPort {
  const raw = config.get<string>('EMAIL_PROVIDER', 'nodemailer').toLowerCase();
  switch (raw as EmailProviderName) {
    case 'resend':
      return new ResendEmailAdapter(config);
    case 'sendgrid':
      return new SendGridEmailAdapter(config);
    case 'nodemailer':
    default:
      return new NodemailerEmailAdapter(config);
  }
}
