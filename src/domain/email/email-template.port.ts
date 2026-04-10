import type {
  CaseCreatedEmailTemplateContext,
  OtpEmailTemplateContext,
  RecoveryEmailTemplateContext,
  WelcomeEmailTemplateContext,
} from './email-template-contexts';
import type { RenderedEmail } from './rendered-email';

export interface EmailTemplatePort {
  renderRecovery(
    language: string,
    context: RecoveryEmailTemplateContext,
  ): Promise<RenderedEmail>;

  renderWelcome(
    language: string,
    context: WelcomeEmailTemplateContext,
  ): Promise<RenderedEmail>;

  renderCaseCreated(
    language: string,
    context: CaseCreatedEmailTemplateContext,
  ): Promise<RenderedEmail>;

  renderOtp(
    language: string,
    context: OtpEmailTemplateContext,
  ): Promise<RenderedEmail>;
}
