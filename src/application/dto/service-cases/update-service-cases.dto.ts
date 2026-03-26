import { IsOptional, IsString } from 'class-validator';

export class UpdateServiceCasesDto {
  @IsOptional()
  @IsString()
  observations?: string;
}
