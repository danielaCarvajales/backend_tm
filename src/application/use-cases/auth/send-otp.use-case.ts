import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import type { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import type { IPersonRepository } from '../../../domain/repositories/person.repository';
import { SendOtpDto } from '../../dto/auth/send-otp.dto';
import { OtpAuditService } from '../../../infrastructure/otp/otp-audit.service';
import { OtpRateLimitService } from '../../../infrastructure/otp/otp-rate-limit.service';
import { OtpStoreService } from '../../../infrastructure/otp/otp-store.service';
import { SendOtpEmailService } from '../../../infrastructure/email/send-otp-email.service';
import { resolveEmailLanguageFromSources } from '../../../infrastructure/i18n/supported-email-locales';

export const SEND_OTP_GENERIC_MESSAGE =
  'Si el correo está registrado, recibirá un código en breve.';

export type SendOtpResponse = {
  data: null;
  message: string;
};

@Injectable()
export class SendOtpUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly credentials: ICredentialsRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly persons: IPersonRepository,
    private readonly otpRateLimit: OtpRateLimitService,
    private readonly otpStore: OtpStoreService,
    private readonly sendOtpEmail: SendOtpEmailService,
    private readonly audit: OtpAuditService,
  ) {}

  async execute(
    dto: SendOtpDto,
    clientIp: string,
    acceptLanguageHeader?: string | null,
  ): Promise<SendOtpResponse> {
    const email = dto.email;
    try {
      await this.otpRateLimit.enforceEmailLimit(email);
    } catch (e) {
      if (e instanceof HttpException) {
        const status = e.getStatus();
        if (status === HttpStatus.TOO_MANY_REQUESTS) {
          this.audit.logRequest({
            clientIp,
            normalizedEmail: email,
            outcome: 'rate_limited_email',
          });
        } else if (status === HttpStatus.SERVICE_UNAVAILABLE) {
          this.audit.logRequest({
            clientIp,
            normalizedEmail: email,
            outcome: 'dependency_unavailable',
          });
        }
      }
      throw e;
    }

    const credential = await this.credentials.findByUsernameCaseInsensitive(
      email,
    );
    if (!credential) {
      this.audit.logRequest({
        clientIp,
        normalizedEmail: email,
        outcome: 'skipped_unknown_email',
      });
      return { data: null, message: SEND_OTP_GENERIC_MESSAGE };
    }

    const person = await this.persons.findById(
      credential.idPerson,
      credential.codeCompany,
    );
    const displayName = person?.fullName?.trim() || 'Usuario';
    const language = resolveEmailLanguageFromSources(
      person?.language,
      acceptLanguageHeader,
    );

    let plainOtp: string;
    try {
      plainOtp = await this.otpStore.createAndStoreOtp(email);
    } catch {
      this.audit.logRequest({
        clientIp,
        normalizedEmail: email,
        outcome: 'otp_store_failed',
      });
      return { data: null, message: SEND_OTP_GENERIC_MESSAGE };
    }

    try {
      await this.sendOtpEmail.send(email, displayName, plainOtp, language);
    } catch {
      await this.otpStore.removeOtp(email);
      this.audit.logRequest({
        clientIp,
        normalizedEmail: email,
        outcome: 'email_send_failed',
      });
      return { data: null, message: SEND_OTP_GENERIC_MESSAGE };
    }

    this.audit.logRequest({
      clientIp,
      normalizedEmail: email,
      outcome: 'otp_sent',
    });

    return { data: null, message: SEND_OTP_GENERIC_MESSAGE };
  }
}
