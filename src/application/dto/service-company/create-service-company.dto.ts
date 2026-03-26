import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateServiceCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
