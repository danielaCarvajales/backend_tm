import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UpdateCaseDocumentsDto {
  @Type(() => Number)
  @IsInt()
  idDocument: number;
}
