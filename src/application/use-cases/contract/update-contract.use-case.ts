import { Inject, Injectable } from '@nestjs/common';
import { Contract } from '../../../domain/entities/contract.entity';
import {
  ContractWithRelations,
  IContractRepository,
} from '../../../domain/repositories/contract.repository';
import { UpdateContractDto } from '../../dto/contract/update-contract.dto';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';

@Injectable()
export class UpdateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
  ) {}

  async execute(
    idContract: number,
    dto: UpdateContractDto,
  ): Promise<ContractWithRelations> {
    const existing = await this.contractRepository.findById(idContract);
    if (!existing) {
      throw new Error('CONTRACT_NOT_FOUND');
    }

    const entity = new Contract(
      idContract,
      existing.contractCode,
      existing.idCase,
      dto.digitalSignature,
      existing.createdAt,
    );

    await this.contractRepository.update(entity);

    const updated = await this.contractRepository.findByIdWithRelations(
      idContract,
    );
    if (!updated) {
      throw new Error('CONTRACT_NOT_FOUND');
    }
    return updated;
  }
}
