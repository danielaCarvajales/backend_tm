import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTypeDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  nameTypeDocument: string;
}
