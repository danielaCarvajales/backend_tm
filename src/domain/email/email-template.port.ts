import type {
  CaseCreatedEmailTemplateContext,
  OtpEmailTemplateContext,
  RecoveryEmailTemplateContext,
  WelcomeEmailTemplateContext,
} from './email-template-contexts';

//Puerto: renderizado de plantillas
export interface EmailTemplatePort {
  renderRecovery(context: RecoveryEmailTemplateContext): Promise<string>;

  renderWelcome(context: WelcomeEmailTemplateContext): Promise<string>;

  renderCaseCreated(
    context: CaseCreatedEmailTemplateContext,
  ): Promise<string>;

  renderOtp(context: OtpEmailTemplateContext): Promise<string>;
}
