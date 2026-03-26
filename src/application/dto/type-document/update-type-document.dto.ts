import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTypeDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nameTypeDocument?: string;
}
