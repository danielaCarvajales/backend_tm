import { Inject, Injectable } from '@nestjs/common';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import {
  IPersonRoleRepository,
  PersonRolePaginatedResult,
  PersonRoleWithRole,
} from '../../../domain/repositories/person-role.repository';
import { QueryPersonRoleDto } from '../../dto/person-role/query-person-role.dto';
import { PERSON_ROLE_REPOSITORY } from '../../tokens/person-role.repository.token';

@Injectable()
export class ListPersonRolesUseCase {
  constructor(
    @Inject(PERSON_ROLE_REPOSITORY)
    private readonly repository: IPersonRoleRepository,
  ) {}

  async execute(
    query: QueryPersonRoleDto,
  ): Promise<PersonRolePaginatedResult<PersonRoleWithRole>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    return this.repository.findPaginated({
      page,
      pageSize,
      idPerson: query.idPerson,
      codeCompany: query.codeCompany,
    });
  }
}
