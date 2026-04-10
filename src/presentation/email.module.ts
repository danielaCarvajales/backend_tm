import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  EMAIL_SENDER_PORT,
  EMAIL_TEMPLATE_PORT,
} from '../application/tokens/email.tokens';
import { SendCaseCreatedEmailUseCase } from '../application/use-cases/email/send-case-created-email.use-case';
import { SendRecoveryEmailUseCase } from '../application/use-cases/email/send-recovery-email.use-case';
import { SendWelcomeEmailUseCase } from '../application/use-cases/email/send-welcome-email.use-case';
import type { EmailSenderPort } from '../domain/email/email-sender.port';
import { createEmailSenderAdapter } from '../infrastructure/email/email-provider.factory';
import { HandlebarsEmailTemplateService } from '../infrastructure/email/handlebars-email-template.service';
import { EmailI18nService } from '../infrastructure/email/email-i18n.service';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailI18nService,
    HandlebarsEmailTemplateService,
    {
      provide: EMAIL_TEMPLATE_PORT,
      useExisting: HandlebarsEmailTemplateService,
    },
    {
      provide: EMAIL_SENDER_PORT,
      useFactory: (config: ConfigService): EmailSenderPort =>
        createEmailSenderAdapter(config),
      inject: [ConfigService],
    },
    SendRecoveryEmailUseCase,
    SendWelcomeEmailUseCase,
    SendCaseCreatedEmailUseCase,
  ],
  exports: [
    EMAIL_SENDER_PORT,
    EMAIL_TEMPLATE_PORT,
    SendRecoveryEmailUseCase,
    SendWelcomeEmailUseCase,
    SendCaseCreatedEmailUseCase,
  ],
})
export class EmailModule {}
