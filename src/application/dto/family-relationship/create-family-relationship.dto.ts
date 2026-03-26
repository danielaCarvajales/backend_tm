import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFamilyRelationshipDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  nameFamilyRelationship: string;
}
