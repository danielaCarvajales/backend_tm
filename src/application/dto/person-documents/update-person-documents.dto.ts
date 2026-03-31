import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UpdatePersonDocumentsDto {
  @Type(() => Number)
  @IsInt()
  idDocument: number;
}
