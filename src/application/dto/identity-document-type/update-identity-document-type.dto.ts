import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateIdentityDocumentTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  abbreviation?: string;
}
