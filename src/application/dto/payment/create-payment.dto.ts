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

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  idContract: number;

  @Type(() => Number)
  @IsInt()
  idPaymentPlan: number;

  @Type(() => Number)
  @IsInt()
  idDocument: number;

  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberInstallments: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  paymentDescription?: string;
}
