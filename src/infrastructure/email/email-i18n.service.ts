import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { SupportedEmailLocale } from '../i18n/supported-email-locales';


@Injectable()
export class EmailI18nService {
  constructor(private readonly i18n: I18nService) {}

  translate(
    lang: SupportedEmailLocale,
    key: string,
    args?: Record<string, unknown>,
  ): string {
    const fullKey = `email.${key}` as never;
    return this.i18n.t(fullKey, { lang, args: args ?? {} });
  }
}
