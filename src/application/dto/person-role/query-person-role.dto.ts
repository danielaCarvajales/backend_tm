import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPersonRoleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPerson?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  codeCompany?: number;
}
