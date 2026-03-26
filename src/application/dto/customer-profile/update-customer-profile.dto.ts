import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPersonRole?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  codeCustomer?: string;
}
