import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import {
  EMAIL_SENDER_PORT,
  EMAIL_TEMPLATE_PORT,
} from '../../tokens/email.tokens';

export interface SendRecoveryEmailParams {
  to: string;
  name: string;
  resetLink: string;
}

@Injectable()
export class SendRecoveryEmailUseCase {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
    private readonly config: ConfigService,
  ) {}

  async execute(params: SendRecoveryEmailParams): Promise<void> {
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_RECOVERY') ??
      'Recuperación de contraseña — TM';
    const title =
      this.config.get<string>('EMAIL_HEADING_RECOVERY') ?? subject;
    const html = await this.templates.renderRecovery({
      name: params.name,
      resetLink: params.resetLink,
      title,
      buttonText: 'Restablecer contraseña',
    });
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
