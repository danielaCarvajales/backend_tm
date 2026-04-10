import { readFile } from 'fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import type { EmailTemplatePort } from '../../domain/email/email-template.port';
import type {
  CaseCreatedEmailTemplateContext,
  LayoutEmailTemplateContext,
  OtpEmailTemplateContext,
  RecoveryEmailTemplateContext,
  WelcomeEmailTemplateContext,
} from '../../domain/email/email-template-contexts';
import type { RenderedEmail } from '../../domain/email/rendered-email';
import { EMAIL_FOOTER_STYLES } from './email-footer-styles';
import { EMAIL_LAYOUT_STYLES } from './email-layout-styles';
import { resolveEmailLogoUrl } from './email-logo-url.resolver';
import { EmailI18nService } from './email-i18n.service';
import type { SupportedEmailLocale } from '../i18n/supported-email-locales';
import { toSupportedEmailLocale } from '../i18n/supported-email-locales';

@Injectable()
export class HandlebarsEmailTemplateService implements EmailTemplatePort {
  private readonly templatesDir: string;
  private readonly compileCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor(
    private readonly config: ConfigService,
    private readonly emailI18n: EmailI18nService,
  ) {
    this.templatesDir = join(__dirname, 'templates', 'email');
  }

  private lang(language: string): SupportedEmailLocale {
    return toSupportedEmailLocale(language);
  }

  private t(
    lng: SupportedEmailLocale,
    key: string,
    args?: Record<string, unknown>,
  ): string {
    return this.emailI18n.translate(lng, key, args);
  }

  /** Evita romper el HTML si usuario/contraseña contienen &lt; &amp; etc. */
  private escapeForEmailHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private async compileRoot(file: string): Promise<Handlebars.TemplateDelegate> {
    const key = `root:${file}`;
    const cached = this.compileCache.get(key);
    if (cached) {
      return cached;
    }
    const fullPath = join(this.templatesDir, file);
    const source = await readFile(fullPath, 'utf-8');
    const compiled = Handlebars.compile(source);
    this.compileCache.set(key, compiled);
    return compiled;
  }

  private async renderFooter(lng: SupportedEmailLocale): Promise<string> {
    const tpl = await this.compileRoot('footer.hbs');
    const companyName =
      this.config.get<string>('EMAIL_FOOTER_COMPANY_NAME') ??
      this.config.get<string>('EMAIL_COMPANY_NAME') ??
      'TRAMITES MIGRATORIOS EU';
    const copyrightYear =
      this.config.get<string>('EMAIL_FOOTER_COPYRIGHT_YEAR') ??
      String(new Date().getFullYear());
    const rightsSuffix = this.t(lng, 'footer.rightsSuffix');
    const rightsLine = this.t(lng, 'footer.rightsLine', {
      copyrightYear,
      companyName,
      rightsSuffix,
    });
    return tpl({
      styles: EMAIL_FOOTER_STYLES,
      companyName,
      copyrightYear,
      address:
        this.config.get<string>('EMAIL_FOOTER_ADDRESS') ??
        this.config.get<string>('EMAIL_ADDRESS') ??
        'Avenida 65, los Angeles',
      email:
        this.config.get<string>('EMAIL_FOOTER_EMAIL') ??
        this.config.get<string>('EMAIL_EMAIL') ??
        'tramites@tm.com',
      phone:
        this.config.get<string>('EMAIL_FOOTER_PHONE') ??
        this.config.get<string>('EMAIL_PHONE') ??
        '+506 2222 2222',
      linkInstitution:
        this.config.get<string>('EMAIL_FOOTER_LINK_INSTITUTION') ??
        this.config.get<string>('EMAIL_LINK_INSTITUTION') ??
        '#',
      linkWeb:
        this.config.get<string>('EMAIL_FOOTER_LINK_WEB') ??
        this.config.get<string>('EMAIL_LINK_WEB') ??
        '#',
      linkPortal:
        this.config.get<string>('EMAIL_FOOTER_LINK_PORTAL') ??
        this.config.get<string>('EMAIL_LINK_PORTAL') ??
        '#',
      titleInstitution: this.t(lng, 'footer.linkInstitutionTitle'),
      titleWeb: this.t(lng, 'footer.linkWebTitle'),
      titlePortal: this.t(lng, 'footer.linkPortalTitle'),
      rightsLine,
    });
  }

  private async wrapLayout(
    lng: SupportedEmailLocale,
    ctx: LayoutEmailTemplateContext,
  ): Promise<string> {
    const [layoutTpl, footerHtml] = await Promise.all([
      this.compileRoot('layout.hbs'),
      this.renderFooter(lng),
    ]);
    const logoUrl = resolveEmailLogoUrl(this.config);
    return layoutTpl({
      ...ctx,
      footerHtml,
      logoUrl,
      styles: EMAIL_LAYOUT_STYLES,
      htmlLang: lng,
      greetingPrefix: this.t(lng, 'common.greetingPrefix'),
      brandAlt: this.t(lng, 'common.brandAlt'),
    });
  }

  async renderRecovery(
    language: string,
    context: RecoveryEmailTemplateContext,
  ): Promise<RenderedEmail> {
    const lng = this.lang(language);
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_RECOVERY')?.trim() ??
      this.t(lng, 'recovery.subject');
    const title =
      this.config.get<string>('EMAIL_HEADING_RECOVERY')?.trim() ??
      this.t(lng, 'recovery.heading');
    const messageHtml = this.t(lng, 'recovery.bodyHtml');
    const buttonText = this.t(lng, 'recovery.buttonReset');
    const layoutCtx: LayoutEmailTemplateContext = {
      title,
      name: context.name,
      messageHtml,
      buttonText,
      buttonLink: context.resetLink,
    };
    const html = await this.wrapLayout(lng, layoutCtx);
    return { subject, html };
  }

  async renderWelcome(
    language: string,
    context: WelcomeEmailTemplateContext,
  ): Promise<RenderedEmail> {
    const lng = this.lang(language);
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_WELCOME')?.trim() ??
      this.t(lng, 'welcome.subject');
    const title =
      this.config.get<string>('EMAIL_HEADING_WELCOME')?.trim() ??
      this.t(lng, 'welcome.heading');
    const credArgs = {
      username: this.escapeForEmailHtml(context.username),
      password: this.escapeForEmailHtml(context.plainPassword),
    };
    const messageHtml = context.dashboardLink
      ? this.t(lng, 'welcome.bodyWithDashboard', credArgs)
      : this.t(lng, 'welcome.bodyWithoutDashboard', credArgs);
    const buttonText = context.dashboardLink
      ? this.t(lng, 'welcome.buttonDashboard')
      : undefined;
    const layoutCtx: LayoutEmailTemplateContext = {
      title,
      name: context.name,
      messageHtml,
      buttonText,
      buttonLink: context.dashboardLink,
    };
    const html = await this.wrapLayout(lng, layoutCtx);
    return { subject, html };
  }

  async renderCaseCreated(
    language: string,
    context: CaseCreatedEmailTemplateContext,
  ): Promise<RenderedEmail> {
    const lng = this.lang(language);
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_CASE_CREATED')?.trim() ??
      this.t(lng, 'caseCreated.subject', { caseCode: context.caseCode });
    const title =
      this.config.get<string>('EMAIL_HEADING_CASE_CREATED')?.trim() ??
      this.t(lng, 'caseCreated.heading');
    const messageHtml = context.caseDetailLink
      ? this.t(lng, 'caseCreated.bodyWithLink', { caseCode: context.caseCode })
      : this.t(lng, 'caseCreated.bodyWithoutLink', {
          caseCode: context.caseCode,
        });
    const buttonText = context.caseDetailLink
      ? this.t(lng, 'caseCreated.buttonViewCase')
      : undefined;
    const layoutCtx: LayoutEmailTemplateContext = {
      title,
      name: context.name,
      messageHtml,
      buttonText,
      buttonLink: context.caseDetailLink,
    };
    const html = await this.wrapLayout(lng, layoutCtx);
    return { subject, html };
  }

  async renderOtp(
    language: string,
    context: OtpEmailTemplateContext,
  ): Promise<RenderedEmail> {
    const lng = this.lang(language);
    const subject =
      this.config.get<string>('EMAIL_SUBJECT_OTP')?.trim() ??
      this.t(lng, 'otp.subject');
    const title =
      this.config.get<string>('EMAIL_HEADING_OTP')?.trim() ??
      this.t(lng, 'otp.heading');
    const messageHtml = this.t(lng, 'otp.bodyHtml', {
      otpCode: context.otpCode,
      expiresMinutes: context.expiresMinutes,
    });
    const layoutCtx: LayoutEmailTemplateContext = {
      title,
      name: context.name,
      messageHtml,
    };
    const html = await this.wrapLayout(lng, layoutCtx);
    return { subject, html };
  }
}
