import { Matches, MaxLength, MinLength } from 'class-validator';
import { VerifyOtpDto } from './verify-otp.dto';

const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export class ResetPasswordWithOtpDto extends VerifyOtpDto {
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message:
      'La contraseña debe contener al menos una mayúscula, un número y un símbolo (@$!%*?&)',
  })
  @MaxLength(250)
  newPassword!: string;
}
