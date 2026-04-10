import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePersonDto {
  private static readonly LANGUAGE_REGEX = /^[a-z]{2}$/;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  fullName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idTypeDocument?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idNationality?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(250)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(UpdatePersonDto.LANGUAGE_REGEX, {
    message: 'El idioma debe tener formato ISO 639-1 (ej: es, en, pt)',
  })
  language?: string;
}
