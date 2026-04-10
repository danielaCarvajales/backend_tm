import { Inject, Injectable } from '@nestjs/common';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import { EMAIL_SENDER_PORT, EMAIL_TEMPLATE_PORT } from '../../tokens/email.tokens';

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
  language: string;
  dashboardLink?: string;
  username: string;
  plainPassword: string;
}

@Injectable()
export class SendWelcomeEmailUseCase {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
  ) {}

  async execute(params: SendWelcomeEmailParams): Promise<void> {
    const { subject, html } = await this.templates.renderWelcome(
      params.language,
      {
        name: params.name,
        dashboardLink: params.dashboardLink,
        username: params.username,
        plainPassword: params.plainPassword,
      },
    );
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
