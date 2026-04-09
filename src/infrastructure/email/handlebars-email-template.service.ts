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
import { EMAIL_FOOTER_STYLES } from './email-footer-styles';
import { EMAIL_LAYOUT_STYLES } from './email-layout-styles';
import { resolveEmailLogoUrl } from './email-logo-url.resolver';

@Injectable()
export class HandlebarsEmailTemplateService implements EmailTemplatePort {
  private readonly templatesDir: string;
  private readonly compileCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor(private readonly config: ConfigService) {
    this.templatesDir = join(__dirname, 'templates', 'email');
  }

  private async compileFile(
    relativePath: string,
  ): Promise<Handlebars.TemplateDelegate> {
    const key = relativePath;
    const cached = this.compileCache.get(key);
    if (cached) {
      return cached;
    }
    const fullPath = join(this.templatesDir, relativePath);
    const source = await readFile(fullPath, 'utf-8');
    const compiled = Handlebars.compile(source);
    this.compileCache.set(key, compiled);
    return compiled;
  }

  private async renderFragment(
    templateFile: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    const tpl = await this.compileFile(templateFile);
    return tpl(data);
  }

  private async renderFooter(): Promise<string> {
    const tpl = await this.compileFile('footer.hbs');
    const companyName =
      this.config.get<string>('EMAIL_FOOTER_COMPANY_NAME') ??
      this.config.get<string>('EMAIL_COMPANY_NAME') ??
      'TRAMITES MIGRATORIOS EU';
    return tpl({
      styles: EMAIL_FOOTER_STYLES,
      companyName,
      copyrightYear:
        this.config.get<string>('EMAIL_FOOTER_COPYRIGHT_YEAR') ??
        String(new Date().getFullYear()),
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
    });
  }

  private async wrapLayout(ctx: LayoutEmailTemplateContext): Promise<string> {
    const [layoutTpl, footerHtml] = await Promise.all([
      this.compileFile('layout.hbs'),
      this.renderFooter(),
    ]);
    const logoUrl = resolveEmailLogoUrl(this.config);
    return layoutTpl({ ...ctx, footerHtml, logoUrl, styles: EMAIL_LAYOUT_STYLES });
  }

  async renderRecovery(
    context: RecoveryEmailTemplateContext,
  ): Promise<string> {
    const messageHtml = await this.renderFragment('recovery-body.hbs', {
      name: context.name,
    });
    const layoutCtx: LayoutEmailTemplateContext = {
      title: context.title,
      name: context.name,
      messageHtml,
      buttonText: context.buttonText,
      buttonLink: context.resetLink,
    };
    return this.wrapLayout(layoutCtx);
  }

  async renderWelcome(
    context: WelcomeEmailTemplateContext,
  ): Promise<string> {
    const messageHtml = await this.renderFragment('welcome-body.hbs', {
      name: context.name,
      dashboardLink: context.dashboardLink ?? null,
    });
    const layoutCtx: LayoutEmailTemplateContext = {
      title: context.title,
      name: context.name,
      messageHtml,
      buttonText: context.buttonText,
      buttonLink: context.dashboardLink,
    };
    return this.wrapLayout(layoutCtx);
  }

  async renderCaseCreated(
    context: CaseCreatedEmailTemplateContext,
  ): Promise<string> {
    const messageHtml = await this.renderFragment('case-created-body.hbs', {
      name: context.name,
      caseCode: context.caseCode,
      caseDetailLink: context.caseDetailLink ?? null,
    });
    const layoutCtx: LayoutEmailTemplateContext = {
      title: context.title,
      name: context.name,
      messageHtml,
      buttonText: context.buttonText,
      buttonLink: context.caseDetailLink,
    };
    return this.wrapLayout(layoutCtx);
  }

  async renderOtp(context: OtpEmailTemplateContext): Promise<string> {
    const messageHtml = await this.renderFragment('otp-body.hbs', {
      name: context.name,
      otpCode: context.otpCode,
      expiresMinutes: context.expiresMinutes,
    });
    const layoutCtx: LayoutEmailTemplateContext = {
      title: context.title,
      name: context.name,
      messageHtml,
    };
    return this.wrapLayout(layoutCtx);
  }
}
