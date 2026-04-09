import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ResetPasswordWithOtpDto } from '../../dto/auth/reset-password-with-otp.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import type { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { OtpStoreService } from '../../../infrastructure/otp/otp-store.service';
import { hashPassword } from '../../../infrastructure/auth/utils/password.util';
import { Credentials } from '../../../domain/entities/credentials.entity';

export type ResetPasswordWithOtpResponse = {
  data: null;
  message: string;
};

@Injectable()
export class ResetPasswordWithOtpUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly credentials: ICredentialsRepository,
    private readonly otpStore: OtpStoreService,
  ) {}

  async execute(dto: ResetPasswordWithOtpDto): Promise<ResetPasswordWithOtpResponse> {
    const credential = await this.credentials.findByUsernameCaseInsensitive(dto.email);
    if (!credential) {
      throw new BadRequestException('Código OTP inválido o expirado');
    }

    const valid = await this.otpStore.isOtpValid(dto.email, dto.otp);
    if (!valid) {
      throw new BadRequestException('Código OTP inválido o expirado');
    }

    const hashedPassword = await hashPassword(dto.newPassword);
    const updated = new Credentials(
      credential.id,
      credential.username,
      hashedPassword,
      credential.state,
      credential.lastAccess,
      credential.idPerson,
      credential.codeCompany,
      0,
      null,
    );
    await this.credentials.update(updated);
    await this.otpStore.consumeOtp(dto.email);

    return {
      data: null,
      message: 'Contraseña actualizada correctamente',
    };
  }
}
