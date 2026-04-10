import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonDto {
  private static readonly LANGUAGE_REGEX = /^[a-z]{2}$/;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  fullName: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  idTypeDocument: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  documentNumber: string;

  @IsDateString()
  @IsNotEmpty()
  birthdate: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  idNationality: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @IsOptional()
  @IsString()
  @Matches(CreatePersonDto.LANGUAGE_REGEX, {
    message: 'El idioma debe tener formato ISO 639-1 (ej: es, en, pt)',
  })
  language?: string;
}
