import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberInstallments?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idDocument?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  paymentDescription?: string;
}
