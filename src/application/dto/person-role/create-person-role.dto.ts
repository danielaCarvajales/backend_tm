import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonRoleDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'El ID de persona es requerido' })
  idPerson: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'El ID de rol es requerido' })
  idRole: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idState?: number = 1;
}
