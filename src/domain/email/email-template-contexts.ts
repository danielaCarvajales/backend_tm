/**
 * Layout base (layout.hbs). All user-visible copy can be passed from config or use cases.
 */
export interface LayoutEmailTemplateContext {
  title: string;
  name: string;
  messageHtml: string;
  buttonText?: string;
  buttonLink?: string;
  status?: string;
}

export interface RecoveryEmailBodyContext {
  name: string;
}

export type RecoveryEmailTemplateContext = RecoveryEmailBodyContext & {
  resetLink: string;
  title: string;
  buttonText: string;
};

export interface WelcomeEmailBodyContext {
  name: string;
}

export type WelcomeEmailTemplateContext = WelcomeEmailBodyContext & {
  title: string;
  dashboardLink?: string;
  buttonText?: string;
};

export interface CaseCreatedEmailBodyContext {
  name: string;
  caseCode: string;
  caseDetailLink?: string;
}

export type CaseCreatedEmailTemplateContext = CaseCreatedEmailBodyContext & {
  title: string;
  buttonText?: string;
};

export interface OtpEmailBodyContext {
  name: string;
  otpCode: string;
  expiresMinutes: number;
}

export type OtpEmailTemplateContext = OtpEmailBodyContext & {
  title: string;
};
