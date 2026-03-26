import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  nameCompany: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  prefixCompany: string;

  @IsOptional()
  @IsInt()
  stateCompany?: number = 1;
}
