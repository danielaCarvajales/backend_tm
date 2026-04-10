import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export class UpdateCredentialsDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message:
      'La contraseña debe contener al menos una mayúscula, un número y un símbolo (@$!%*?&)',
  })
  @MaxLength(250)
  password?: string;

  @IsOptional()
  @IsInt()
  state?: number;

  @IsOptional()
  @IsDateString()
  lastAccess?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPerson?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  failedAttempts?: number;

  @IsOptional()
  @IsDateString()
  accountLockedUntil?: string | null;
}
