import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCasePersonDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idFamilyRelationship?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statePerson?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;
}
