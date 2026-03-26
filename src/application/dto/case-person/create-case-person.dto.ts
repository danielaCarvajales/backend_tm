import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCasePersonDto {
  @Type(() => Number)
  @IsInt()
  idPerson: number;

  @Type(() => Number)
  @IsInt()
  idFamilyRelationship: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idCase?: number;

  /**
   * Cuando true, omite la validación de unicidad (persona ya en caso).
   * Solo usar tras confirmación explícita del usuario en frontend.
   */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  forceDuplicate?: boolean;
}
