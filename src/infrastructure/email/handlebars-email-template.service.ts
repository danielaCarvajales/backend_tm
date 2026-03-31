import { readFile } from 'fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import type { EmailTemplatePort } from '../../domain/email/email-template.port';
import type {
  CaseCreatedEmailTemplateContext,
  LayoutEmailTemplateContext,
  RecoveryEmailTemplateContext,
  WelcomeEmailTemplateContext,
} from '../../domain/email/email-template-contexts';

@Injectable()
export class HandlebarsEmailTemplateService implements EmailTemplatePort {
  private readonly templatesDir: string;
  private readonly compileCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor() {
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

  private async wrapLayout(ctx: LayoutEmailTemplateContext): Promise<string> {
    const layout = await this.compileFile('layout.hbs');
    return layout(ctx);
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
      footerHtml: context.footerHtml,
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
      footerHtml: context.footerHtml,
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
      footerHtml: context.footerHtml,
    };
    return this.wrapLayout(layoutCtx);
  }
}
