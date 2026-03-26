import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNationalityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  abbreviation: string;
}
