import { Inject, Injectable } from '@nestjs/common';
import {
  StateListQuery,
  StatePaginatedResult,
} from '../../../domain/repositories/state.repository';
import { State } from '../../../domain/entities/state.entity';
import { IStateRepository } from '../../../domain/repositories/state.repository';
import { QueryStateDto } from '../../dto/state/query-state.dto';
import { STATE_REPOSITORY } from '../../tokens/state.repository.token';

@Injectable()
export class ListStatesUseCase {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly repository: IStateRepository,
  ) {}

  async execute(query: QueryStateDto): Promise<StatePaginatedResult<State>> {
    const domainQuery: StateListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
