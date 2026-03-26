import { IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for login request.
 * Security: Inputs are validated and sanitized by class-validator (whitelist in ValidationPipe).
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @MaxLength(250, { message: 'El nombre de usuario no puede exceder 250 caracteres' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;

  @Type(() => Number)
  @IsInt({ message: 'El código de empresa debe ser un número entero' })
  @IsNotEmpty({ message: 'El código de empresa es requerido' })
  codeCompany: number;
}
