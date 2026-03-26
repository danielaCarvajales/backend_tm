import { Inject, Injectable } from '@nestjs/common';
import {
  CompanyListQuery,
  CompanyPaginatedResult,
} from '../../../domain/repositories/company.repository';
import { Company } from '../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../domain/repositories/company.repository';
import { QueryCompanyDto } from '../../dto/company/query-company.dto';
import { COMPANY_REPOSITORY } from '../../tokens/company.repository.token';

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(query: QueryCompanyDto): Promise<CompanyPaginatedResult<Company>> {
    const domainQuery: CompanyListQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
