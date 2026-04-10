import { Inject, Injectable } from '@nestjs/common';
import {
  PersonListQuery,
  PersonPaginatedResult,
  PersonWithRelations,
} from '../../../domain/repositories/person.repository';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { QueryPersonDto } from '../../dto/person/query-person.dto';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { AuthContext, ensureCanManageCompanyUsers } from '../../auth/auth-context';

@Injectable()
export class ListPersonsUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly repository: IPersonRepository,
  ) {}

  async execute(
    query: QueryPersonDto,
    authContext?: AuthContext,
  ): Promise<PersonPaginatedResult<PersonWithRelations>> {
    if (authContext) {
      ensureCanManageCompanyUsers(authContext);
    }
    const scopedCompanyId = authContext
      ? authContext.companyId
      : query.companyId;
    const domainQuery: PersonListQuery = {
      companyId: scopedCompanyId,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
    };
    return this.repository.findPaginated(domainQuery, scopedCompanyId);
  }
}
