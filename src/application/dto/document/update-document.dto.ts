import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  descriptionDocument?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idTypeDocument?: number;
}
