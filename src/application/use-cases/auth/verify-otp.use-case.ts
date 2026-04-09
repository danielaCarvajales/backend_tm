import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VerifyOtpDto } from '../../dto/auth/verify-otp.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import type { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { OtpStoreService } from '../../../infrastructure/otp/otp-store.service';

export type VerifyOtpResponse = {
  data: { valid: true };
  message: string;
};

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly credentials: ICredentialsRepository,
    private readonly otpStore: OtpStoreService,
  ) {}

  async execute(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const credential = await this.credentials.findByUsernameCaseInsensitive(dto.email);
    if (!credential) {
      throw new BadRequestException('Código OTP inválido o expirado');
    }

    const valid = await this.otpStore.isOtpValid(dto.email, dto.otp);
    if (!valid) {
      throw new BadRequestException('Código OTP inválido o expirado');
    }

    return {
      data: { valid: true },
      message: 'Código OTP válido',
    };
  }
}
