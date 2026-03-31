import type {
  CaseCreatedEmailTemplateContext,
  RecoveryEmailTemplateContext,
  WelcomeEmailTemplateContext,
} from './email-template-contexts';

/**
 * Puerto: renderizado de plantillas (sin HTML en casos de uso).
 */
export interface EmailTemplatePort {
  renderRecovery(context: RecoveryEmailTemplateContext): Promise<string>;

  renderWelcome(context: WelcomeEmailTemplateContext): Promise<string>;

  renderCaseCreated(
    context: CaseCreatedEmailTemplateContext,
  ): Promise<string>;
}
