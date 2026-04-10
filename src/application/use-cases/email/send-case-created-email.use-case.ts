import { Inject, Injectable } from '@nestjs/common';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import { EMAIL_SENDER_PORT, EMAIL_TEMPLATE_PORT } from '../../tokens/email.tokens';

export interface SendCaseCreatedEmailParams {
  to: string;
  name: string;
  language: string;
  caseCode: string;
  caseDetailLink?: string;
}

@Injectable()
export class SendCaseCreatedEmailUseCase {
  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
    @Inject(EMAIL_TEMPLATE_PORT)
    private readonly templates: EmailTemplatePort,
  ) {}

  async execute(params: SendCaseCreatedEmailParams): Promise<void> {
    const { subject, html } = await this.templates.renderCaseCreated(
      params.language,
      {
        name: params.name,
        caseCode: params.caseCode,
        caseDetailLink: params.caseDetailLink,
      },
    );
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
