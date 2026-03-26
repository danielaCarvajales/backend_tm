import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  nameState: string;
}
