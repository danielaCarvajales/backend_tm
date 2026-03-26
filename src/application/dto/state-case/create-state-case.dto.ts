import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStateCaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  nameState: string;
}
