import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIdentityDocumentTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  abbreviation: string;
}
