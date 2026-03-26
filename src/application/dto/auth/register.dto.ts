import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Password policy: min 8 chars, 1 uppercase, 1 digit, 1 special symbol (@$!%*?&)
 * Security: Prevents weak passwords; bcrypt handles storage (cost factor 12).
 */
const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @MaxLength(250)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message:
      'La contraseña debe contener al menos una mayúscula, un número y un símbolo (@$!%*?&)',
  })
  password: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'El código de empresa es requerido' })
  codeCompany: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'El ID de persona es requerido' })
  idPerson: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  state?: number = 1;

  @IsDateString()
  lastAccess: string;
}
