import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStateDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nameState?: string;
}
