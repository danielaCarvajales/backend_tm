import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonDto {

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
}
