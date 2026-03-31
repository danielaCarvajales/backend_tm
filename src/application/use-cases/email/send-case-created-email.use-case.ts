import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailSenderPort } from '../../../domain/email/email-sender.port';
import type { EmailTemplatePort } from '../../../domain/email/email-template.port';
import { EMAIL_SENDER_PORT, EMAIL_TEMPLATE_PORT } from '../../tokens/email.tokens';

export interface SendCaseCreatedEmailParams {
  to: string;
  name: string;
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
    private readonly config: ConfigService,
  ) {}

  async execute(params: SendCaseCreatedEmailParams): Promise<void> {
    const footerHtml =
      this.config.get<string>('EMAIL_FOOTER_HTML') ??
      '<p>TM — Notificación automática.</p>';
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_CASE_CREATED') ??
      `Caso ${params.caseCode} creado — TM`;
    const title =
      this.config.get<string>('EMAIL_HEADING_CASE_CREATED') ??
      'Nuevo caso registrado';
    const html = await this.templates.renderCaseCreated({
      name: params.name,
      caseCode: params.caseCode,
      caseDetailLink: params.caseDetailLink,
      title,
      buttonText: params.caseDetailLink ? 'Ver caso' : undefined,
      footerHtml,
    });
    await this.emailSender.sendEmail({
      to: params.to,
      subject,
      html,
    });
  }
}
