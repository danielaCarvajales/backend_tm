import { IsOptional, IsString, MaxLength } from 'class-validator';

// Application DTO: Update Nationality  
export class UpdateNationalityDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  abbreviation?: string;
}
