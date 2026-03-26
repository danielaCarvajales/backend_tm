import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateCustomerProfileDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty({ message: 'El ID de person_role es requerido' })
  idPersonRole: number;
}
