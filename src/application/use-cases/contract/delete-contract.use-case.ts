import { Inject, Injectable } from '@nestjs/common';
import { IContractRepository } from '../../../domain/repositories/contract.repository';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';

@Injectable()
export class DeleteContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
  ) {}

  async execute(idContract: number): Promise<void> {
    const existing = await this.contractRepository.findById(idContract);
    if (!existing) {
      throw new Error('CONTRACT_NOT_FOUND');
    }
    await this.contractRepository.delete(idContract);
  }
}
