import { Inject, Injectable } from '@nestjs/common';
import {
  NationalityListQuery,
  NationalityPaginatedResult,
} from '../../../domain/repositories/nationality.repository';
import { Nationality } from '../../../domain/entities/nationality.entity';
import { INationalityRepository } from '../../../domain/repositories/nationality.repository';
import { QueryNationalityDto } from '../../dto/nationality/query-nationality.dto';
import { NATIONALITY_REPOSITORY } from '../../tokens/nationality.repository.token';

@Injectable()
export class ListNationalitiesUseCase {
  constructor(
    @Inject(NATIONALITY_REPOSITORY)
    private readonly repository: INationalityRepository,
  ) {}

  async execute(query: QueryNationalityDto): Promise<NationalityPaginatedResult<Nationality>> {
    const domainQuery: NationalityListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
