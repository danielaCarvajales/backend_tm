import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreatePersonDto } from '../person/create-person.dto';

const AMOUNT_DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;
const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export class RegisterClientWithCaseDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

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

  @IsString()
  @IsNotEmpty()
  @Matches(AMOUNT_DECIMAL_REGEX, {
    message: 'amount debe ser un decimal positivo con hasta 2 decimales',
  })
  amount: string;

  /** `null` u omitido si los service-cases se crearán después. */
  @ValidateIf((o) => o.serviceIds != null)
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  serviceIds?: number[] | null;
}
