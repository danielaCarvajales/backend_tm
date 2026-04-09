import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Debe indicar un correo electrónico válido' })
  @MaxLength(254, {
    message: 'El correo electrónico no puede exceder 254 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsNotEmpty({ message: 'El código OTP es obligatorio' })
  @Matches(/^\d{6}$/, { message: 'El código OTP debe tener 6 dígitos' })
  otp!: string;
}
