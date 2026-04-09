import { BadRequestException } from '@nestjs/common';
import { comparePassword } from '../../../../infrastructure/auth/utils/password.util';
import { Credentials } from '../../../../domain/entities/credentials.entity';
import type { ICredentialsRepository } from '../../../../domain/repositories/credentials.repository';
import { OtpStoreService } from '../../../../infrastructure/otp/otp-store.service';
import { ResetPasswordWithOtpUseCase } from '../reset-password-with-otp.use-case';

describe('ResetPasswordWithOtpUseCase', () => {
  let useCase: ResetPasswordWithOtpUseCase;
  let credentialsRepo: jest.Mocked<ICredentialsRepository>;
  let otpStore: jest.Mocked<Pick<OtpStoreService, 'isOtpValid' | 'consumeOtp'>>;

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
      consumeOtp: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ResetPasswordWithOtpUseCase(
      credentialsRepo,
      otpStore as unknown as OtpStoreService,
    );
  });

  it('updates password and consumes otp when otp is valid', async () => {
    const existing = new Credentials(
      1,
      'user@example.com',
      'old-hash',
      1,
      new Date(),
      10,
      1,
      2,
      new Date(),
    );
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(existing);
    otpStore.isOtpValid.mockResolvedValue(true);
    credentialsRepo.update.mockImplementation(async (c) => c);

    const result = await useCase.execute({
      email: 'user@example.com',
      otp: '123456',
      newPassword: 'NewPass1!',
    });

    expect(result.message).toBe('Contraseña actualizada correctamente');
    expect(credentialsRepo.update).toHaveBeenCalledTimes(1);
    const updated = credentialsRepo.update.mock.calls[0][0];
    await expect(comparePassword('NewPass1!', updated.password)).resolves.toBe(true);
    expect(updated.failedAttempts).toBe(0);
    expect(updated.accountLockedUntil).toBeNull();
    expect(otpStore.consumeOtp).toHaveBeenCalledWith('user@example.com');
  });

  it('throws bad request when otp is invalid', async () => {
    credentialsRepo.findByUsernameCaseInsensitive.mockResolvedValue(
      new Credentials(1, 'user@example.com', 'hash', 1, new Date(), 10, 1, 0, null),
    );
    otpStore.isOtpValid.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        otp: '123456',
        newPassword: 'NewPass1!',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(credentialsRepo.update).not.toHaveBeenCalled();
  });
});
