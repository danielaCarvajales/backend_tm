import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  name?: string;
}
