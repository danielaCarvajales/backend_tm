import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFamilyRelationshipDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nameFamilyRelationship?: string;
}
