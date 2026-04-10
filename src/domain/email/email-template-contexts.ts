/** Contextos mínimos para plantillas; textos visibles salen de i18n (email.*). */
export interface LayoutEmailTemplateContext {
  title: string;
  name: string;
  messageHtml: string;
  buttonText?: string;
  buttonLink?: string;
  status?: string;
}

export interface RecoveryEmailTemplateContext {
  name: string;
  resetLink: string;
}

export interface WelcomeEmailTemplateContext {
  name: string;
  dashboardLink?: string;
  username: string;
  plainPassword: string;
}

export interface CaseCreatedEmailTemplateContext {
  name: string;
  caseCode: string;
  caseDetailLink?: string;
}

export interface OtpEmailTemplateContext {
  name: string;
  otpCode: string;
  expiresMinutes: number;
}
