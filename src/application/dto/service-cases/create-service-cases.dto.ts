import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceCasesDto {
  @Type(() => Number)
  @IsInt()
  idService: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
