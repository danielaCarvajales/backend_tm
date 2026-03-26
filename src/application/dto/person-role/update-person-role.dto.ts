import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePersonRoleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPerson?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idRole?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codeCompany?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idState?: number;

  @IsOptional()
  @IsDateString()
  revocationDate?: string | null;
}
