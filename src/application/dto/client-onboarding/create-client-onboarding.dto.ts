import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreatePersonDto } from '../person/create-person.dto';

const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export class ClientOnboardingCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message:
      'La contraseña debe contener al menos una mayúscula, un número y un símbolo (@$!%*?&)',
  })
  @MaxLength(250)
  password: string;
}

export class ClientOnboardingCaseDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ValidateIf((o) => o.serviceIds != null)
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  serviceIds?: number[] | null;
}

export class CreateClientOnboardingDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @ValidateNested()
  @Type(() => ClientOnboardingCredentialsDto)
  credentials: ClientOnboardingCredentialsDto;

  @ValidateNested()
  @Type(() => ClientOnboardingCaseDto)
  case: ClientOnboardingCaseDto;
}
