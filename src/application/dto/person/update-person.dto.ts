import { IsDateString, IsEmail, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePersonDto {

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
}
