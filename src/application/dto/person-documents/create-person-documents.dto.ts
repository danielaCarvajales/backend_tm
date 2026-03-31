import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreatePersonDocumentsDto {
  @Type(() => Number)
  @IsInt()
  idPerson: number;

  @Type(() => Number)
  @IsInt()
  idDocument: number;
}
