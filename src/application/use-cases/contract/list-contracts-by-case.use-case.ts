import { Inject, Injectable } from '@nestjs/common';
import {
  ContractListQuery,
  ContractPaginatedResult,
  ContractWithRelations,
  IContractRepository,
} from '../../../domain/repositories/contract.repository';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class ListContractsByCaseUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecordRepository: ICaseRecordRepository,
  ) {}

  async execute(params: {
    idCase: number;
    page?: number;
    pageSize?: number;
  }): Promise<ContractPaginatedResult<ContractWithRelations>> {
    const caseRecord = await this.caseRecordRepository.findById(params.idCase);
    if (!caseRecord) {
      throw new Error('CASE_NOT_FOUND');
    }

    const query: ContractListQuery = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      idCase: params.idCase,
    };
    return this.contractRepository.findPaginated(query);
  }
}
