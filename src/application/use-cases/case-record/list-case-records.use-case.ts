import { Inject, Injectable } from '@nestjs/common';
import {CaseRecordPaginatedResult, CaseRecordWithRelations, ICaseRecordRepository} from '../../../domain/repositories/case-record.repository';
import { QueryCaseRecordDto } from '../../dto/case-record/query-case-record.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';

@Injectable()
export class ListCaseRecordsUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
  ) {}

  async execute(
    query: QueryCaseRecordDto,
    userId: number,
    role: string,
    codeCompany: number,
  ): Promise<CaseRecordPaginatedResult<CaseRecordWithRelations>> {
    const normalizedRole = role?.toLowerCase() ?? '';
    const isCliente = normalizedRole === 'cliente';

    const domainQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
      holderFilter: isCliente ? userId : undefined,
      codeCompanyFilter: isCliente ? codeCompany : undefined,
    };

    return this.repository.findPaginated(domainQuery);
  }
}
