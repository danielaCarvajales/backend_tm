import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../../domain/entities/role.entity';
import {
  IRoleRepository,
  RolePaginatedResult,
} from '../../../domain/repositories/role.repository';
import { QueryRoleDto } from '../../dto/role/query-role.dto';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(query: QueryRoleDto): Promise<RolePaginatedResult<Role>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    return this.repository.findPaginated({ page, pageSize, search: query.search });
  }
}
