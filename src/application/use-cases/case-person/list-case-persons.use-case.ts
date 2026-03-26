import { Inject, Injectable } from '@nestjs/common';
import {
  CasePersonPaginatedResult,
  CasePersonWithRelations,
  ICasePersonRepository,
} from '../../../domain/repositories/case-person.repository';
import { QueryCasePersonDto } from '../../dto/case-person/query-case-person.dto';
import { CASE_PERSON_REPOSITORY } from '../../tokens/case-person.repository.token';

@Injectable()
export class ListCasePersonsUseCase {
  constructor(
    @Inject(CASE_PERSON_REPOSITORY)
    private readonly repository: ICasePersonRepository,
  ) {}

  async execute(
    query: QueryCasePersonDto,
  ): Promise<CasePersonPaginatedResult<CasePersonWithRelations>> {
    const domainQuery = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      idCase: query.caseId,
    };
    return this.repository.findPaginated(domainQuery);
  }
}
