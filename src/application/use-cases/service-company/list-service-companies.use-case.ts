import { Inject, Injectable } from '@nestjs/common';
import {
  ServiceCompanyListQuery,
  ServiceCompanyPaginatedResult,
} from '../../../domain/repositories/service-company.repository';
import { ServiceCompany } from '../../../domain/entities/service-company.entity';
import { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { QueryServiceCompanyDto } from '../../dto/service-company/query-service-company.dto';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';

@Injectable()
export class ListServiceCompaniesUseCase {
  constructor(
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly repository: IServiceCompanyRepository,
  ) {}

  async execute(
    query: QueryServiceCompanyDto,
    codeCompany: number,
  ): Promise<ServiceCompanyPaginatedResult<ServiceCompany>> {
    const domainQuery: ServiceCompanyListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      codeCompany,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
