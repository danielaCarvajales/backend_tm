import { IsOptional, IsInt, Min, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

const AMOUNT_DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class UpdateCaseRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idStateCase?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  agent?: number;

  @IsOptional()
  @IsString()
  @Matches(AMOUNT_DECIMAL_REGEX, {
    message: 'amount debe ser un decimal positivo con hasta 2 decimales',
  })
  amount?: string;
}
