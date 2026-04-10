import { HttpException } from '@nestjs/common';
import { SendOtpUseCase, SEND_OTP_GENERIC_MESSAGE } from '../send-otp.use-case';
import { SendOtpDto } from '../../../dto/auth/send-otp.dto';
import { Credentials } from '../../../../domain/entities/credentials.entity';
import { Person } from '../../../../domain/entities/person.entity';
import type { ICredentialsRepository } from '../../../../domain/repositories/credentials.repository';
import type { IPersonRepository } from '../../../../domain/repositories/person.repository';
import { OtpAuditService } from '../../../../infrastructure/otp/otp-audit.service';
import { OtpRateLimitService } from '../../../../infrastructure/otp/otp-rate-limit.service';
import { OtpStoreService } from '../../../../infrastructure/otp/otp-store.service';
import { SendOtpEmailService } from '../../../../infrastructure/email/send-otp-email.service';

describe('SendOtpUseCase', () => {
  let useCase: SendOtpUseCase;
  let credentialsRepo: jest.Mocked<ICredentialsRepository>;
  let personRepo: jest.Mocked<IPersonRepository>;
  let otpRateLimit: jest.Mocked<Pick<OtpRateLimitService, 'enforceEmailLimit'>>;
  let otpStore: jest.Mocked<Pick<OtpStoreService, 'createAndStoreOtp' | 'removeOtp'>>;
  let sendOtpEmail: jest.Mocked<Pick<SendOtpEmailService, 'send'>>;
  let audit: jest.Mocked<Pick<OtpAuditService, 'logRequest'>>;

  const dto: SendOtpDto = { email: 'user@example.com' };
  const ip = '10.0.0.1';

  beforeEach(() => {
    credentialsRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByUsernameAndCompany: jest.fn(),
      findByUsernameCaseInsensitive: jest.fn(),
      findPaginated: jest.fn(),
    };
    personRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByPersonCode: jest.fn(),
      findPaginated: jest.fn(),
    };
    otpRateLimit = { enforceEmailLimit: jest.fn().mockResolvedValue(undefined) };
    otpStore = {
      createAndStoreOtp: jest.fn().mockResolvedValue('111222'),
      removeOtp: jest.fn().mockResolvedValue(undefined),
    };
    sendOtpEmail = { send: jest.fn().mockResolvedValue(undefined) };
    audit = { logRequest: jest.fn() };

    useCase = new SendOtpUseCase(
      credentialsRepo,
      personRepo,
      otpRateLimit as unknown as OtpRateLimitService,
      otpStore as unknown as OtpStoreService,
      sendOtpEmail as unknown as SendOtpEmailService,
      audit as unknown as OtpAuditService,
    );
  });

  it('returns generic message when credential is unknown', async () => {
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(null);
    const result = await useCase.execute(dto, ip);
    expect(result.data).toBeNull();
    expect(result.message).toBe(SEND_OTP_GENERIC_MESSAGE);
    expect(otpStore.createAndStoreOtp).not.toHaveBeenCalled();
    expect(audit.logRequest).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'skipped_unknown_email' }),
    );
  });

  it('sends email when user exists', async () => {
    const cred = new Credentials(
      1,
      'user@example.com',
      'hash',
      1,
      new Date(),
      5,
      1,
      0,
      null,
    );
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(cred);
    personRepo.findById.mockResolvedValue(
      new Person(5, 1, 'P1', 'Jane Doe', 1, 'x', new Date(), 1, '', ''),
    );
    const result = await useCase.execute(dto, ip);
    expect(result.data).toBeNull();
    expect(result.message).toBe(SEND_OTP_GENERIC_MESSAGE);
    expect(sendOtpEmail.send).toHaveBeenCalledWith(
      'user@example.com',
      'Jane Doe',
      '111222',
      'es',
    );
    expect(audit.logRequest).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'otp_sent' }),
    );
  });

  it('rethrows when email rate limit exceeded', async () => {
    otpRateLimit.enforceEmailLimit.mockRejectedValue(
      new HttpException(
        { message: 'Demasiadas solicitudes para este correo.', code: 'RATE_LIMIT' },
        429,
      ),
    );
    await expect(useCase.execute(dto, ip)).rejects.toBeInstanceOf(HttpException);
    expect(audit.logRequest).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'rate_limited_email' }),
    );
  });

  it('returns generic message when email send fails and removes otp', async () => {
    const cred = new Credentials(
      1,
      'user@example.com',
      'hash',
      1,
      new Date(),
      5,
      1,
      0,
      null,
    );
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(cred);
    personRepo.findById.mockResolvedValue(null);
    sendOtpEmail.send.mockRejectedValue(new Error('smtp down'));
    const result = await useCase.execute(dto, ip);
    expect(result.data).toBeNull();
    expect(result.message).toBe(SEND_OTP_GENERIC_MESSAGE);
    expect(otpStore.removeOtp).toHaveBeenCalledWith('user@example.com');
    expect(audit.logRequest).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'email_send_failed' }),
    );
  });
});
