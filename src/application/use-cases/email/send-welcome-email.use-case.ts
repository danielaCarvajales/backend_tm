import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import { EMAIL_SENDER_PORT, EMAIL_TEMPLATE_PORT } from '../../tokens/email.tokens';

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
  dashboardLink?: string;
}

@Injectable()
export class SendWelcomeEmailUseCase {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
    private readonly config: ConfigService,
  ) {}

  async execute(params: SendWelcomeEmailParams): Promise<void> {
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_WELCOME') ?? 'Bienvenido a TM';
    const title =
      this.config.get<string>('EMAIL_HEADING_WELCOME') ?? subject;
    const html = await this.templates.renderWelcome({
      name: params.name,
      title,
      dashboardLink: params.dashboardLink,
      buttonText: params.dashboardLink ? 'Ir al panel' : undefined,
    });
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
