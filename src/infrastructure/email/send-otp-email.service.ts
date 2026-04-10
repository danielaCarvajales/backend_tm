import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../domain/email/email-template.port';
import {
  EMAIL_SENDER_PORT,
  EMAIL_TEMPLATE_PORT,
} from '../../application/tokens/email.tokens';

@Injectable()
export class SendOtpEmailService {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
    private readonly config: ConfigService,
  ) {}

  async send(
    to: string,
    displayName: string,
    plainOtp: string,
    language: string = 'es',
  ): Promise<void> {
    const ttlSec = this.config.get<number>('OTP_TTL_SECONDS', 600);
    const expiresMinutes = Math.max(1, Math.floor(ttlSec / 60));
    const { subject, html } = await this.templates.renderOtp(language, {
      name: displayName,
      otpCode: plainOtp,
      expiresMinutes,
    });
    await this.emailSender.sendEmail({
      to,
      subject,
      html,
    });
  }
}
