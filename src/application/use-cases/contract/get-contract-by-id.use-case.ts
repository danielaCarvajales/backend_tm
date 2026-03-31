import { Inject, Injectable } from '@nestjs/common';
import {
  ContractWithRelations,
  IContractRepository,
} from '../../../domain/repositories/contract.repository';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';

@Injectable()
export class GetContractByIdUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
  ) {}

  async execute(idContract: number): Promise<ContractWithRelations | null> {
    return this.contractRepository.findByIdWithRelations(idContract);
  }
}
