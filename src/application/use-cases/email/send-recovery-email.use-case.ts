import { Inject, Injectable } from '@nestjs/common';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import {
  EMAIL_SENDER_PORT,
  EMAIL_TEMPLATE_PORT,
} from '../../tokens/email.tokens';

export interface SendRecoveryEmailParams {
  to: string;
  name: string;
  language: string;
  resetLink: string;
}

@Injectable()
export class SendRecoveryEmailUseCase {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
  ) {}

  async execute(params: SendRecoveryEmailParams): Promise<void> {
    const { subject, html } = await this.templates.renderRecovery(
      params.language,
      {
        name: params.name,
        resetLink: params.resetLink,
      },
    );
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
