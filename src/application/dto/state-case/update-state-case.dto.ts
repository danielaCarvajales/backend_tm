import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStateCaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nameState?: string;
}
