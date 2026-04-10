import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

const AMOUNT_DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreateCaseRecordDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  holderPersonId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(AMOUNT_DECIMAL_REGEX, {
    message: 'el valor del caso debe ser un decimal positivo con hasta 2 decimales',
  })
  amount: string;

  /** `null` u omitido si aún no hay servicios de compañía; se asocian después vía case-services. */
  @ValidateIf((o) => o.serviceIds != null)
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  serviceIds?: number[] | null;
}
