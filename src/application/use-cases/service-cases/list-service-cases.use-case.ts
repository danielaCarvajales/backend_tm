import { Inject, Injectable } from '@nestjs/common';
import {
  ServiceCasesListQuery,
  ServiceCasesPaginatedResult,
  ServiceCasesWithRelations,
} from '../../../domain/repositories/service-cases.repository';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { QueryServiceCasesDto } from '../../dto/service-cases/query-service-cases.dto';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class ListServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
  ) {}

  async execute(
    query: QueryServiceCasesDto,
    idCase: number,
  ): Promise<ServiceCasesPaginatedResult<ServiceCasesWithRelations>> {
    const domainQuery: ServiceCasesListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idCase: query.idCase ?? idCase,
    };
    return this.repository.findPaginatedWithRelations(domainQuery);
  }
}
