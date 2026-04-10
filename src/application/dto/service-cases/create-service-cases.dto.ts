import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceCasesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCase: number;

  @Type(() => Number)
  @IsInt()
  idService: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
