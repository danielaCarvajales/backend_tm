import { Inject, Injectable } from '@nestjs/common';
import {
  ContractListQuery,
  ContractPaginatedResult,
  ContractWithRelations,
  IContractRepository,
} from '../../../domain/repositories/contract.repository';
import { QueryContractDto } from '../../dto/contract/query-contract.dto';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';

@Injectable()
export class ListContractsUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
  ) {}

  async execute(
    query: QueryContractDto,
  ): Promise<ContractPaginatedResult<ContractWithRelations>> {
    const domainQuery: ContractListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idCase: query.idCase,
    };
    return this.contractRepository.findPaginated(domainQuery);
  }
}
