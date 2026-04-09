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

  async send(to: string, displayName: string, plainOtp: string): Promise<void> {
    const ttlSec = this.config.get<number>('OTP_TTL_SECONDS', 600);
    const expiresMinutes = Math.max(1, Math.floor(ttlSec / 60));
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_OTP') ?? 'Tu código de verificación — TM';
    const title =
      this.config.get<string>('EMAIL_HEADING_OTP') ?? 'Código de verificación';
    const html = await this.templates.renderOtp({
      name: displayName,
      otpCode: plainOtp,
      expiresMinutes,
      title,
    });
    await this.emailSender.sendEmail({
      to,
      subject,
      html,
    });
  }
}
