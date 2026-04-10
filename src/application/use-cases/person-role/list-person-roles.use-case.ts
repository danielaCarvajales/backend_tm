import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import {
  IPersonRoleRepository,
  PersonRolePaginatedResult,
  PersonRoleWithRole,
} from '../../../domain/repositories/person-role.repository';
import { QueryPersonRoleDto } from '../../dto/person-role/query-person-role.dto';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';
import { AuthContext, ensureCompanyAccess } from '../../auth/auth-context';

@Injectable()
export class ListPersonRolesUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(
    query: QueryPersonRoleDto,
    authContext?: AuthContext,
  ): Promise<PersonRolePaginatedResult<PersonRoleWithRole>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    if (authContext && query.codeCompany !== undefined) {
      ensureCompanyAccess(authContext, query.codeCompany);
    }
    const result = await this.repository.findPaginated({
      page,
      pageSize,
      idPerson: query.idPerson,
      codeCompany: query.codeCompany,
    });
    if (!authContext) {
      return result;
    }
    const scoped = result.data.filter((personRole) => {
      try {
        ensureCompanyAccess(authContext, personRole.codeCompany);
        return true;
      } catch {
        return false;
      }
    });
    return {
      ...result,
      data: scoped,
      totalItems: scoped.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: scoped.length || result.pageSize,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
}
