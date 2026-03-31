import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePaymentPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3650)
  dueDays?: number;
}
