import { Transform } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

export class UpdateContractDto {
  
  @IsString()
  @IsIn(['Si', 'No'])
  digitalSignature: string;
}
