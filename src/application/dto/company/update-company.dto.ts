import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nameCompany?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  prefixCompany?: string;

  @IsOptional()
  @IsInt()
  stateCompany?: number;
}
