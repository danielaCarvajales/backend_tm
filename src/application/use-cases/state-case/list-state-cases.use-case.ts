import { Inject, Injectable } from '@nestjs/common';
import {
  StateCaseListQuery,
  StateCasePaginatedResult,
} from '../../../domain/repositories/state-case.repository';
import { StateCase } from '../../../domain/entities/state-case.entity';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { QueryStateCaseDto } from '../../dto/state-case/query-state-case.dto';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';

@Injectable()
export class ListStateCasesUseCase {
  constructor(
    @Inject(STATE_CASE_REPOSITORY)
    private readonly repository: IStateCaseRepository,
  ) {}

  async execute(
    query: QueryStateCaseDto,
  ): Promise<StateCasePaginatedResult<StateCase>> {
    const domainQuery: StateCaseListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
