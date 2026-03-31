import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateCaseDocumentsDto {
  @Type(() => Number)
  @IsInt()
  idCase: number;

  @Type(() => Number)
  @IsInt()
  idDocument: number;
}
