import {Type } from 'class-transformer';
import { IsIn, IsInt, IsString, Min } from 'class-validator';

export class CreateContractDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCase: number;

  
  @IsString()
  @IsIn(['Si', 'No'])
  digitalSignature: string;
}
