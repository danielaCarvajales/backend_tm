import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @MaxLength(250)
  name: string;
}
