import { BadRequestException } from '@nestjs/common';
import { VerifyOtpUseCase } from '../verify-otp.use-case';
import type { ICredentialsRepository } from '../../../../domain/repositories/credentials.repository';
import { OtpStoreService } from '../../../../infrastructure/otp/otp-store.service';
import { Credentials } from '../../../../domain/entities/credentials.entity';

describe('VerifyOtpUseCase', () => {
  let useCase: VerifyOtpUseCase;
  let credentialsRepo: jest.Mocked<ICredentialsRepository>;
  let otpStore: jest.Mocked<Pick<OtpStoreService, 'isOtpValid'>>;

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
    otpStore = {
      isOtpValid: jest.fn(),
    };
    useCase = new VerifyOtpUseCase(
      credentialsRepo,
      otpStore as unknown as OtpStoreService,
    );
  });

  it('returns valid=true when credential exists and OTP is valid', async () => {
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(
      new Credentials(1, 'user@example.com', 'hash', 1, new Date(), 10, 1, 0, null),
    );
    otpStore.isOtpValid.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'user@example.com', otp: '123456' }),
    ).resolves.toEqual({
      data: { valid: true },
      message: 'Código OTP válido',
    });
  });

  it('throws bad request when OTP is invalid', async () => {
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(
      new Credentials(1, 'user@example.com', 'hash', 1, new Date(), 10, 1, 0, null),
    );
    otpStore.isOtpValid.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@example.com', otp: '123456' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
